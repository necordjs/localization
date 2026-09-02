import { Module, Provider } from '@nestjs/common';
import { IntentsBitField } from 'discord.js';
import { NestFactory } from '@nestjs/core';
import { NecordModule } from 'necord';

import {
	DefaultLocalizationAdapter,
	NecordLocalizationModule,
	UserResolver
} from '../src/index.js';

async function getLocales() {
	return {
		'en-US': {
			'commands.ping.name': 'ping',
			'commands.ping.description': 'Pong!'
		},
		ru: {
			'commands.ping.name': 'пинг',
			'commands.ping.description': 'Понг!'
		}
	};
}

export const createApplication = (...providers: Provider[]) => {
	const discordToken = process.env.DISCORD_TOKEN;
	const testGuild = process.env.DISCORD_TEST_GUILD;

	if (!discordToken || !testGuild) {
		throw new Error('DISCORD_TOKEN and DISCORD_TEST_GUILD are required for local tests');
	}

	@Module({
		imports: [
			NecordModule.forRoot({
				token: discordToken,
				intents: [
					IntentsBitField.Flags.Guilds,
					IntentsBitField.Flags.DirectMessages,
					IntentsBitField.Flags.GuildMembers,
					IntentsBitField.Flags.GuildMessages,
					IntentsBitField.Flags.MessageContent
				],
				prefix: '!',
				development: [testGuild]
			}),
			NecordLocalizationModule.forRootAsync({
				useFactory: async () => {
					const locales = await getLocales();

					return {
						resolvers: UserResolver,
						adapter: new DefaultLocalizationAdapter({
							fallbackLocale: 'en-US',
							locales
						})
					};
				}
			})
		],
		providers
	})
	class AppModule {}

	return NestFactory.createApplicationContext(AppModule);
};
