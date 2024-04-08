import { ConfigurableModuleBuilder } from '@nestjs/common';
import { NecordLocalizationOptions } from './interfaces';
import { DefaultLocalizationAdapter } from './adapters';
import { LOCALIZATION_ADAPTER } from './providers';
import { LocaleResolvers } from './enums';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<NecordLocalizationOptions>()
		.setClassMethodName('forRoot')
		.setFactoryMethodName('createModuleConfig')
		.setExtras<NecordLocalizationOptions>(
			{ adapter: DefaultLocalizationAdapter, resolver: LocaleResolvers.User },
			(definition, extras) => {
				const adapterProvider =
					extras.adapter instanceof Function
						? {
								provide: LOCALIZATION_ADAPTER,
								useClass: extras.adapter
							}
						: { provide: LOCALIZATION_ADAPTER, useValue: extras.adapter };

				return {
					...definition,
					providers: [...definition.providers, adapterProvider],
					exports: [...(definition.exports ?? []), adapterProvider]
				};
			}
		)
		.build();
