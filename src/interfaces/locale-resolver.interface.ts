import { ExecutionContext } from '@nestjs/common';

export interface LocaleResolver {
	resolve(context: ExecutionContext): Promise<string | string[]> | string | string[];
}
