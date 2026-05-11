import { Type } from '@nestjs/common';

import { LocaleResolver } from './locale-resolver.interface';
import { BaseLocalizationAdapter } from '../adapters';

export type NecordLocalizationResolvers =
	| (LocaleResolver | Type<LocaleResolver>)[]
	| Type<LocaleResolver>
	| LocaleResolver;

export interface NecordLocalizationOptions {
	adapter: BaseLocalizationAdapter;
	resolvers: NecordLocalizationResolvers;
}
