import { BaseLocalizationAdapter } from '../adapters';
import { LocaleResolvers } from '../enums';

export interface NecordLocalizationOptions {
	adapter: BaseLocalizationAdapter;
	resolver?: LocaleResolvers;
}
