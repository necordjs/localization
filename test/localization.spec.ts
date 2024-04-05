import { Inject, Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { createApplication } from './application.spec';
import {
	DefaultLocalizationAdapter,
	DescriptionTranslations,
	LOCALIZATION_ADAPTER,
	NameTranslations
} from '../src';

@Injectable()
class Localization {
	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: DefaultLocalizationAdapter
	) {}

	@NameTranslations('commands.ping.name')
	@DescriptionTranslations('commands.ping.description')
	@SlashCommand({ name: 'ping', description: 'Pong!' })
	public ping(@Context() [interaction]: SlashCommandContext) {
		const message = this.localizationAdapter.getTranslation(
			'commands.ping.description',
			interaction.locale
		);
		return interaction.reply(message);
	}
}

createApplication(Localization);
