import {
	CommandDiscovery,
	CommandsService,
	NecordContextType,
	NecordExecutionContext,
	SlashCommandDiscovery
} from 'necord';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

import { NecordLocalizationService } from '../src/necord-localization.service.js';
import { GuildResolver, UserResolver } from '../src/resolvers/index.js';
import { DefaultLocalizationAdapter } from '../src/adapters/index.js';
import { CommandContext } from '../src/interfaces/index.js';

describe('Necord 7 compatibility', () => {
	it('localizes metadata discovered through CommandsService', () => {
		const command = new SlashCommandDiscovery({
			name: 'ping',
			description: 'commands.ping.description',
			nameLocalizations: { 'en-US': 'commands.ping.name', de: null },
			descriptionLocalizations: { 'en-US': 'commands.ping.description' }
		});
		const discovery: CommandDiscovery = command;
		const commandsService = {
			getCommands: () => [discovery]
		} as CommandsService;
		const adapter = new DefaultLocalizationAdapter({
			locales: {
				'en-US': {
					'commands.ping.name': 'ping',
					'commands.ping.description': 'Pong!'
				}
			}
		});

		new NecordLocalizationService(adapter, commandsService).onModuleInit();

		expect(command.toJSON()).toMatchObject({
			nameLocalizations: { 'en-US': 'ping', de: null },
			descriptionLocalizations: { 'en-US': 'Pong!' }
		});
		expect(command.getSubcommands()).toHaveLength(0);
		expect(command.getRawOptions()).toEqual({});
	});

	it('reads command contexts through NecordExecutionContext', () => {
		const interaction = {
			locale: 'en-US',
			guildLocale: 'de'
		} as CommandContext[0];
		const command = new SlashCommandDiscovery({
			name: 'ping',
			description: 'Pong!'
		});
		const context = new ExecutionContextHost([[interaction], command]);
		context.setType<NecordContextType>('necord');

		const necordContext = NecordExecutionContext.create(context);

		expect(necordContext.getContext<CommandContext>()).toEqual([interaction]);
		expect(necordContext.getDiscovery()).toBe(command);
		expect(new UserResolver().resolve(context)).toBe('en-US');
		expect(new GuildResolver().resolve(context)).toBe('de');
	});
});
