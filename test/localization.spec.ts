import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { createApplication } from './application.spec';
import { DescriptionTranslations, NameTranslations } from '../src';

@Injectable()
class Localization {
	@NameTranslations('commands.ping.name')
	@DescriptionTranslations('commands.ping.description')
	@SlashCommand({ name: 'ping', description: 'Pong!' })
	public ping(@Context() [interaction]: SlashCommandContext) {
		return interaction.reply('Pong!');
	}
}

createApplication(Localization);
