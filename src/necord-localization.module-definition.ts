import { ConfigurableModuleBuilder } from '@nestjs/common';
import { NecordLocalizationOptions } from './interfaces';
import { DefaultLocalizationAdapter } from './adapters';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<NecordLocalizationOptions>()
		.setClassMethodName('forRoot')
		.setFactoryMethodName('createModuleConfig')
		.setExtras<NecordLocalizationOptions>(
			{ adapter: new DefaultLocalizationAdapter() },
			(definition, extras) => ({
				...definition,
				providers: [
					...definition.providers,
					{ provide: extras.adapter.constructor, useValue: extras.adapter }
				]
			})
		)
		.build();
