import { BaseLocalizationAdapter } from '../adapters';
import { LocaleResolvers } from '../enums';
import { Type } from '@nestjs/common';

export interface NecordLocalizationOptions {
	adapter: BaseLocalizationAdapter | Type<BaseLocalizationAdapter>;
	resolver?: LocaleResolvers;
}
