import { ExecutionContext, Injectable } from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { CommandContext, LocaleResolver } from '../interfaces';

@Injectable()
export class GuildResolver implements LocaleResolver {
	resolve(context: ExecutionContext): string | string[] {
		const necordContext = NecordExecutionContext.create(context);
		const [interaction] = necordContext.getContext<CommandContext>();

		return interaction.guildLocale;
	}
}
