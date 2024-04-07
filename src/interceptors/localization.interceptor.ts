import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NecordContextType, NecordExecutionContext } from 'necord';
import { LOCALIZATION_ADAPTER } from '../providers';
import { BaseLocalizationAdapter } from '../adapters';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CommandContext, NecordLocalizationOptions, TranslationFn } from '../interfaces';
import { MODULE_OPTIONS_TOKEN } from '../necord-localization.module-definition';
import { LocaleResolvers } from '../enums';
import { Reflector } from '@nestjs/core';
import { LocaleResolver } from '../decorators';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
	private static readonly LOCALIZATION_CONTEXT = new AsyncLocalStorage<TranslationFn>();

	public static getCurrentTranslationFn(): TranslationFn {
		return LocalizationInterceptor.LOCALIZATION_CONTEXT.getStore();
	}

	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: BaseLocalizationAdapter,
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly localizationOptions: NecordLocalizationOptions,
		private readonly reflector: Reflector
	) {}

	public intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Observable<any> | Promise<Observable<any>> {
		if (context.getType<NecordContextType>() !== 'necord') return next.handle();

		const necordContext = NecordExecutionContext.create(context);
		const discovery = necordContext.getDiscovery();

		if (!discovery.isSlashCommand() && !discovery.isContextMenu()) {
			return next.handle();
		}

		const locale = this.getLocale(necordContext);

		return LocalizationInterceptor.LOCALIZATION_CONTEXT.run(
			this.getTranslationFn(locale),
			next.handle
		);
	}

	private getLocale(ctx: NecordExecutionContext): string {
		const [interaction] = ctx.getContext<CommandContext>();
		const resolver =
			this.reflector.get<LocaleResolvers>(LocaleResolver.KEY, ctx.getHandler()) ??
			this.localizationOptions.resolver;

		return resolver === LocaleResolvers.User ? interaction.locale : interaction.guildLocale;
	}

	private getTranslationFn(locale: string): TranslationFn {
		return (key: string, ...args: any[]) => {
			return this.localizationAdapter.getTranslation(key, locale, ...args);
		};
	}
}
