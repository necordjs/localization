import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
	OnModuleInit,
	Type
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { NecordContextType, NecordExecutionContext } from 'necord';
import { LOCALIZATION_ADAPTER, LOCALIZATION_RESOLVERS } from '../providers';
import { BaseLocalizationAdapter } from '../adapters';
import { AsyncLocalStorage } from 'node:async_hooks';
import { LocaleResolver, NecordLocalizationOptions, TranslationFn } from '../interfaces';
import { MODULE_OPTIONS_TOKEN } from '../necord-localization.module-definition';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor, OnModuleInit {
	private static readonly LOCALIZATION_CONTEXT = new AsyncLocalStorage<TranslationFn>();

	public static getCurrentTranslationFn(): TranslationFn {
		return LocalizationInterceptor.LOCALIZATION_CONTEXT.getStore();
	}

	private cachedResolvers: LocaleResolver[];

	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: BaseLocalizationAdapter,
		@Inject(LOCALIZATION_RESOLVERS)
		private readonly resolvers: (LocaleResolver | Type<LocaleResolver>)[],
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly localizationOptions: NecordLocalizationOptions,
		private readonly moduleRef: ModuleRef
	) {}

	public async onModuleInit(): Promise<void> {
		this.cachedResolvers = await Promise.all(this.resolvers.map(r => this.getResolver(r)));
	}

	public async intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Promise<Observable<any>> {
		if (context.getType<NecordContextType>() !== 'necord') return next.handle();

		const necordContext = NecordExecutionContext.create(context);
		const discovery = necordContext.getDiscovery();

		if (!discovery.isSlashCommand() && !discovery.isContextMenu()) {
			return next.handle();
		}

		const locale = await this.getLocale(necordContext);

		return LocalizationInterceptor.LOCALIZATION_CONTEXT.run(
			this.getTranslationFn(locale),
			next.handle
		);
	}

	private async getLocale(ctx: ExecutionContext): Promise<string> {
		let language = null;

		for (const resolver of this.cachedResolvers) {
			language = resolver.resolve(ctx);

			if (language instanceof Promise) {
				language = await (language as Promise<string>);
			}

			if (language !== undefined) {
				break;
			}
		}

		return Array.isArray(language) ? language[0] : language;
	}

	private async getResolver(
		resolver: LocaleResolver | Type<LocaleResolver>
	): Promise<LocaleResolver> {
		if (resolver instanceof Function) {
			try {
				return this.moduleRef.get(resolver, { strict: false });
			} catch (e) {
				return this.moduleRef.create(resolver);
			}
		}

		return resolver;
	}

	private getTranslationFn(locale: string): TranslationFn {
		return (key: string, ...args: any[]) => {
			return this.localizationAdapter.getTranslation(key, locale, ...args);
		};
	}
}
