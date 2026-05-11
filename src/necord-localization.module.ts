import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ConfigurableModuleClass } from './necord-localization.module-definition';
import { NecordLocalizationService } from './necord-localization.service';
import { LocalizationInterceptor } from './interceptors';

@Global()
@Module({
	providers: [
		NecordLocalizationService,
		{ provide: APP_INTERCEPTOR, useClass: LocalizationInterceptor }
	],
	exports: []
})
export class NecordLocalizationModule extends ConfigurableModuleClass {}
