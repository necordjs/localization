import { ConfigurableModuleClass } from './necord-localization.module-definition';
import { Global, Module } from '@nestjs/common';
import { NecordLocalizationService } from './necord-localization.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
