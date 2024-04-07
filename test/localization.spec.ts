import { Inject, Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { createApplication } from './application.spec';
import {
	CurrentTranslate,
	DefaultLocalizationAdapter,
	DescriptionTranslations,
	LOCALIZATION_ADAPTER,
	NameTranslations,
	TranslationFn
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
	public ping(
		@Context() [interaction]: SlashCommandContext,
		@CurrentTranslate() t: TranslationFn
	) {
		const message = t('commands.ping.description');
		return interaction.reply(message);
	}

	// @NameTranslations('commands.ping.name')
	// @DescriptionTranslations('commands.ping.description')
	// @SlashCommand({ name: 'ping', description: 'Pong!' })
	// public ping(@Context() [interaction]: SlashCommandContext) {
	// 	const message = this.localizationAdapter.getTranslation(
	// 		'commands.ping.description',
	// 		interaction.locale
	// 	);
	// 	return interaction.reply(message);
	// }
}

createApplication(Localization);
