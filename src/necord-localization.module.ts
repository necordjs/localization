import { ConfigurableModuleClass } from './necord-localization.module-definition';
import { Global, Module } from '@nestjs/common';
import { NecordLocalizationService } from './necord-localization.service';
import { APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';
import { LocalizationInterceptor } from './interceptors';

@Global()
@Module({
	imports: [DiscoveryModule],
	providers: [
		NecordLocalizationService,
		{ provide: APP_INTERCEPTOR, useClass: LocalizationInterceptor }
	],
	exports: []
})
export class NecordLocalizationModule extends ConfigurableModuleClass {}
