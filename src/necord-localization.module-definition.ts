import { ConfigurableModuleBuilder } from '@nestjs/common';
import { NecordLocalizationOptions } from './interfaces';
import { DefaultLocalizationAdapter } from './adapters';
import { LOCALIZATION_ADAPTER, LOCALIZATION_RESOLVERS } from './providers';
import { UserResolver } from './resolvers';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<NecordLocalizationOptions>()
		.setClassMethodName('forRoot')
		.setFactoryMethodName('createModuleConfig')
		.setExtras<NecordLocalizationOptions>(
			{ adapter: DefaultLocalizationAdapter, resolvers: UserResolver },
			(definition, extras) => {
				const adapterProvider =
					extras.adapter instanceof Function
						? {
								provide: LOCALIZATION_ADAPTER,
								useClass: extras.adapter
							}
						: { provide: LOCALIZATION_ADAPTER, useValue: extras.adapter };

				const resolversProviders = {
					provide: LOCALIZATION_RESOLVERS,
					useValue: Array.isArray(extras.resolvers)
						? extras.resolvers
						: [extras.resolvers]
				};

				return {
					...definition,
					providers: [...definition.providers, adapterProvider, resolversProviders],
					exports: [...(definition.exports ?? []), adapterProvider]
				};
			}
		)
		.build();
