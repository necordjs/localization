import type { CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';

import {
	CommandDiscovery,
	CommandsService,
	ContextMenuDiscovery,
	NecordContextType,
	NecordExecutionContext,
	OPTIONS_METADATA,
	SlashCommandDiscovery,
	TextCommandDiscovery
} from 'necord';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { firstValueFrom, of } from 'rxjs';
import { ModuleRef } from '@nestjs/core';

import { NecordLocalizationService } from '../src/necord-localization.service.js';
import { CommandContext, LocaleResolver } from '../src/interfaces/index.js';
import { GuildResolver, UserResolver } from '../src/resolvers/index.js';
import { LocalizationInterceptor } from '../src/interceptors/index.js';
import { DefaultLocalizationAdapter } from '../src/adapters/index.js';

class StaticHandler implements CallHandler<string> {
	public calls = 0;

	public constructor(private readonly value: string) {}

	public handle(): Observable<string> {
		this.calls += 1;
		return of(this.value);
	}
}

class TranslatingHandler implements CallHandler<string> {
	public calls = 0;

	public handle(): Observable<string> {
		this.calls += 1;
		const translate = LocalizationInterceptor.getCurrentTranslationFn();

		if (!translate) {
			throw new Error('Expected an active localization context');
		}

		return of(translate('hello'));
	}
}

function createContext(
	discovery: CommandDiscovery | TextCommandDiscovery,
	type: NecordContextType = 'necord',
	interaction: CommandContext[0] = { locale: 'en-US' } as CommandContext[0]
): ExecutionContextHost {
	const context = new ExecutionContextHost([[interaction], discovery]);
	context.setType<NecordContextType>(type);
	return context;
}

function createInterceptor(
	adapter: DefaultLocalizationAdapter,
	resolvers: LocaleResolver[]
): LocalizationInterceptor {
	return new LocalizationInterceptor(adapter, resolvers, {} as ModuleRef);
}

describe('Necord 7 compatibility', () => {
	it('localizes root, subcommand, context-menu, and option metadata', () => {
		const optionHandler = () => undefined;
		const rawOptions = {
			query: {
				type: ApplicationCommandOptionType.String,
				name: 'query',
				description: 'commands.query.description',
				name_localizations: { 'en-US': 'commands.query.name' },
				description_localizations: { 'en-US': 'commands.query.description' }
			}
		};
		Reflect.defineMetadata(OPTIONS_METADATA, rawOptions, optionHandler);

		const root = new SlashCommandDiscovery({
			name: 'root',
			description: 'commands.root.description',
			nameLocalizations: { 'en-US': 'commands.root.name' },
			descriptionLocalizations: { 'en-US': 'commands.root.description' }
		});
		const group = new SlashCommandDiscovery({
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'group',
			description: 'commands.group.description',
			options: [],
			nameLocalizations: { 'en-US': 'commands.group.name' },
			descriptionLocalizations: { 'en-US': 'commands.group.description' }
		});
		const child = new SlashCommandDiscovery({
			type: ApplicationCommandOptionType.Subcommand,
			name: 'child',
			description: 'commands.child.description',
			nameLocalizations: { 'en-US': 'commands.child.name' },
			descriptionLocalizations: { 'en-US': 'commands.child.description' }
		});
		child.setDiscoveryMeta({ class: class TestCommand {}, handler: optionHandler });
		group.setSubcommand(child);
		root.setSubcommand(group);

		const contextMenu = new ContextMenuDiscovery({
			type: ApplicationCommandType.User,
			name: 'profile',
			nameLocalizations: { 'en-US': 'commands.profile.name' }
		});
		const commandsService = {
			getCommands: () => [root, contextMenu]
		} as unknown as CommandsService;
		const adapter = new DefaultLocalizationAdapter({
			locales: {
				'en-US': {
					'commands.root.name': 'root-localized',
					'commands.root.description': 'Root localized',
					'commands.group.name': 'group-localized',
					'commands.group.description': 'Group localized',
					'commands.child.name': 'child-localized',
					'commands.child.description': 'Child localized',
					'commands.profile.name': 'profile-localized',
					'commands.query.name': 'query-localized',
					'commands.query.description': 'Query localized'
				}
			}
		});

		new NecordLocalizationService(adapter, commandsService).onModuleInit();

		expect(root.toJSON()).toMatchObject({
			nameLocalizations: { 'en-US': 'root-localized' },
			descriptionLocalizations: { 'en-US': 'Root localized' }
		});
		expect(group.toJSON()).toMatchObject({
			nameLocalizations: { 'en-US': 'group-localized' },
			descriptionLocalizations: { 'en-US': 'Group localized' }
		});
		expect(child.toJSON()).toMatchObject({
			nameLocalizations: { 'en-US': 'child-localized' },
			descriptionLocalizations: { 'en-US': 'Child localized' }
		});
		expect(contextMenu.toJSON()).toMatchObject({
			nameLocalizations: { 'en-US': 'profile-localized' }
		});
		expect(rawOptions.query).toMatchObject({
			name_localizations: { 'en-US': 'query-localized' },
			description_localizations: { 'en-US': 'Query localized' }
		});
	});

	it('reads command contexts and lets a missing guild locale fall through', async () => {
		const interaction = {
			locale: 'en-US',
			guildLocale: 'de'
		} as CommandContext[0];
		const command = new SlashCommandDiscovery({
			name: 'ping',
			description: 'Pong!'
		});
		const context = createContext(command, 'necord', interaction);
		const necordContext = NecordExecutionContext.create(context);

		expect(necordContext.getContext<CommandContext>()).toEqual([interaction]);
		expect(necordContext.getDiscovery()).toBe(command);
		expect(new UserResolver().resolve(context)).toBe('en-US');
		expect(new GuildResolver().resolve(context)).toBe('de');

		const directMessage = { locale: 'en-US', guildLocale: null } as CommandContext[0];
		const directMessageContext = createContext(command, 'necord', directMessage);
		expect(new GuildResolver().resolve(directMessageContext)).toBeUndefined();

		const adapter = new DefaultLocalizationAdapter({
			locales: { 'en-US': { hello: 'Hello' } }
		});
		const interceptor = createInterceptor(adapter, [new GuildResolver(), new UserResolver()]);
		const handler = new TranslatingHandler();
		await interceptor.onModuleInit();

		const result = await interceptor.intercept(directMessageContext, handler);

		expect(await firstValueFrom(result)).toBe('Hello');
		expect(handler.calls).toBe(1);
	});

	it('awaits resolvers in order and exposes translation through ALS', async () => {
		const calls: string[] = [];
		const adapter = new DefaultLocalizationAdapter({
			locales: { de: { hello: 'Hallo' } }
		});
		const firstResolver: LocaleResolver = {
			resolve: async () => {
				calls.push('first');
				return undefined;
			}
		};
		const secondResolver: LocaleResolver = {
			resolve: () => {
				calls.push('second');
				return ['de'];
			}
		};
		const interceptor = createInterceptor(adapter, [firstResolver, secondResolver]);
		const handler = new TranslatingHandler();
		const command = new SlashCommandDiscovery({ name: 'ping', description: 'Pong!' });
		await interceptor.onModuleInit();

		const result = await interceptor.intercept(createContext(command), handler);

		expect(await firstValueFrom(result)).toBe('Hallo');
		expect(calls).toEqual(['first', 'second']);
		expect(handler.calls).toBe(1);
		expect(LocalizationInterceptor.getCurrentTranslationFn()).toBeUndefined();
	});

	it('uses adapter fallback when no resolver returns a locale', async () => {
		const adapter = new DefaultLocalizationAdapter({
			fallbackLocale: 'en',
			locales: { en: { hello: 'Hello' } }
		});
		const unresolved: LocaleResolver = { resolve: () => undefined };
		const interceptor = createInterceptor(adapter, [unresolved]);
		const handler = new TranslatingHandler();
		const command = new SlashCommandDiscovery({ name: 'ping', description: 'Pong!' });
		await interceptor.onModuleInit();

		const result = await interceptor.intercept(createContext(command), handler);

		expect(await firstValueFrom(result)).toBe('Hello');
		expect(handler.calls).toBe(1);
		expect(LocalizationInterceptor.getCurrentTranslationFn()).toBeUndefined();
	});

	it('gates non-Necord and non-application-command executions', async () => {
		const adapter = new DefaultLocalizationAdapter();
		const resolver: LocaleResolver = {
			resolve: () => {
				throw new Error('Resolver must not run for gated executions');
			}
		};
		const interceptor = createInterceptor(adapter, [resolver]);
		const handler = new StaticHandler('next');
		const slashCommand = new SlashCommandDiscovery({ name: 'ping', description: 'Pong!' });
		const textCommand = new TextCommandDiscovery({ name: 'ping', description: 'Pong!' });
		await interceptor.onModuleInit();

		const httpResult = await interceptor.intercept(
			createContext(slashCommand, 'http'),
			handler
		);
		const textResult = await interceptor.intercept(createContext(textCommand), handler);

		expect(await firstValueFrom(httpResult)).toBe('next');
		expect(await firstValueFrom(textResult)).toBe('next');
		expect(handler.calls).toBe(2);
	});

	it('executes localization for slash commands and context menus', async () => {
		const adapter = new DefaultLocalizationAdapter({ locales: { de: { hello: 'Hallo' } } });
		const interceptor = createInterceptor(adapter, [{ resolve: () => 'de' }]);
		const discoveries: CommandDiscovery[] = [
			new SlashCommandDiscovery({ name: 'ping', description: 'Pong!' }),
			new ContextMenuDiscovery({ name: 'profile', type: ApplicationCommandType.User })
		];
		await interceptor.onModuleInit();

		for (const discovery of discoveries) {
			const handler = new TranslatingHandler();
			const result = await interceptor.intercept(createContext(discovery), handler);

			expect(await firstValueFrom(result)).toBe('Hallo');
			expect(handler.calls).toBe(1);
		}
	});
});
