import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
	OnModuleInit,
	Type
} from '@nestjs/common';
import { NecordContextType, NecordExecutionContext } from 'necord';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';

import { LOCALIZATION_ADAPTER, LOCALIZATION_RESOLVERS } from '../providers/index.js';
import { LocaleResolver, TranslationFn } from '../interfaces/index.js';
import { BaseLocalizationAdapter } from '../adapters/index.js';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor, OnModuleInit {
	private static readonly LOCALIZATION_CONTEXT = new AsyncLocalStorage<TranslationFn>();

	public static getCurrentTranslationFn(): TranslationFn {
		const translationFn = LocalizationInterceptor.LOCALIZATION_CONTEXT.getStore();

		if (!translationFn) {
			throw new Error('Translation function is unavailable outside a localized context');
		}

		return translationFn;
	}

	private cachedResolvers: LocaleResolver[];

	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: BaseLocalizationAdapter,
		@Inject(LOCALIZATION_RESOLVERS)
		private readonly resolvers: (LocaleResolver | Type<LocaleResolver>)[],
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

		return LocalizationInterceptor.LOCALIZATION_CONTEXT.run(this.getTranslationFn(locale), () =>
			next.handle()
		);
	}

	private async getLocale(ctx: ExecutionContext): Promise<string> {
		let language: string | string[] | undefined;

		for (const resolver of this.cachedResolvers) {
			const resolvedLanguage = resolver.resolve(ctx);
			language =
				resolvedLanguage instanceof Promise ? await resolvedLanguage : resolvedLanguage;

			if (language !== undefined) {
				break;
			}
		}

		const locale = Array.isArray(language) ? language[0] : language;

		if (!locale) {
			throw new Error('Localization resolvers did not return a locale');
		}

		return locale;
	}

	private async getResolver(
		resolver: LocaleResolver | Type<LocaleResolver>
	): Promise<LocaleResolver> {
		if (resolver instanceof Function) {
			try {
				return this.moduleRef.get(resolver, { strict: false });
			} catch {
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
