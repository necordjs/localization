import { Inject, Injectable } from '@nestjs/common';
import {
	Context,
	createCommandGroupDecorator,
	SlashCommand,
	SlashCommandContext,
	Subcommand
} from 'necord';
import { createApplication } from './application.local-spec';
import {
	CurrentTranslate,
	DefaultLocalizationAdapter,
	LOCALIZATION_ADAPTER,
	localizationMapByKey,
	TranslationFn
} from '../src';

const PingCommands = createCommandGroupDecorator({
	name: 'ping',
	description: 'Ping commands'
});

@PingCommands()
@Injectable()
class Localization {
	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: DefaultLocalizationAdapter
	) {}

	@Subcommand({
		name: 'ping',
		description: 'Pong!',
		nameLocalizations: localizationMapByKey('commands.ping.name'),
		descriptionLocalizations: localizationMapByKey('commands.ping.description')
	})
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
