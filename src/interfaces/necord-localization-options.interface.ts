import { Type } from '@nestjs/common';

import { LocaleResolver } from './locale-resolver.interface.js';
import { BaseLocalizationAdapter } from '../adapters/index.js';

export type NecordLocalizationResolvers =
	(LocaleResolver | Type<LocaleResolver>)[] | Type<LocaleResolver> | LocaleResolver;

export interface NecordLocalizationOptions {
	adapter: BaseLocalizationAdapter;
	resolvers: NecordLocalizationResolvers;
}
