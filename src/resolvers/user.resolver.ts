import { ExecutionContext, Injectable } from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { CommandContext, LocaleResolver } from '../interfaces/index.js';

@Injectable()
export class UserResolver implements LocaleResolver {
	resolve(context: ExecutionContext): string | string[] {
		const necordContext = NecordExecutionContext.create(context);
		const [interaction] = necordContext.getContext<CommandContext>();

		return interaction.locale;
	}
}
