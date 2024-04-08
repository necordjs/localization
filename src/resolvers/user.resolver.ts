import { CommandContext, LocaleResolver } from '../interfaces';
import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

@Injectable()
export class UserResolver implements LocaleResolver {
	resolve(context: ExecutionContext): string | string[] | undefined {
		const necordContext = NecordExecutionContext.create(context);
		const [interaction] = necordContext.getContext<CommandContext>();

		return interaction.locale;
	}
}
