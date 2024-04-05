import { ConfigurableModuleClass } from './necord-localization.module-definition';
import { Global, Module } from '@nestjs/common';
import { NecordLocalizationService } from './necord-localization.service';

@Global()
@Module({
	providers: [NecordLocalizationService]
})
export class NecordLocalizationModule extends ConfigurableModuleClass {}
