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
			{ adapter: new DefaultLocalizationAdapter(), resolver: LocaleResolvers.User },
			(definition, extras) => ({
				...definition,
				providers: [
					...definition.providers,
					{ provide: LOCALIZATION_ADAPTER, useValue: extras.adapter }
				],
				exports: [...(definition.exports ?? []), LOCALIZATION_ADAPTER]
			})
		)
		.build();
