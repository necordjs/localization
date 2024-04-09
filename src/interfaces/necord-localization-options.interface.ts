import { BaseLocalizationAdapter } from '../adapters';
import { Type } from '@nestjs/common';
import { LocaleResolver } from './locale-resolver.interface';

export type NecordLocalizationResolvers =
	| (LocaleResolver | Type<LocaleResolver>)[]
	| Type<LocaleResolver>
	| LocaleResolver;

export interface NecordLocalizationOptions {
	adapter: BaseLocalizationAdapter;
	resolvers: NecordLocalizationResolvers;
}
