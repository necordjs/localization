import { Module, Provider } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { DefaultLocalizationAdapter, NecordLocalizationModule, UserResolver } from '../src';

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
	@Module({
		imports: [
			NecordModule.forRoot({
				token: process.env.DISCORD_TOKEN,
				intents: [
					IntentsBitField.Flags.Guilds,
					IntentsBitField.Flags.DirectMessages,
					IntentsBitField.Flags.GuildMembers,
					IntentsBitField.Flags.GuildMessages,
					IntentsBitField.Flags.MessageContent
				],
				prefix: '!',
				development: [process.env.DISCORD_TEST_GUILD]
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
