import { ConfigurableModuleClass } from './necord-localization.module-definition';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({})
export class NecordLocalizationModule extends ConfigurableModuleClass {}
