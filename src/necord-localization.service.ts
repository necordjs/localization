import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CommandDiscovery, CommandsService } from 'necord';
import { Reflector } from '@nestjs/core';
import { DescriptionTranslations, NameTranslations } from './decorators';
import { Locale, LocalizationMap } from 'discord-api-types/v10';
import { LOCALIZATION_ADAPTER } from './providers';
import { DefaultLocalizationAdapter } from './adapters';

@Injectable()
export class NecordLocalizationService implements OnModuleInit {
	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: DefaultLocalizationAdapter,
		private readonly commandsService: CommandsService,
		private readonly reflector: Reflector
	) {}

	public onModuleInit() {
		const commands = this.commandsService.getCommands();

		for (const command of commands) {
			const metadata = this.getLocalizationMetadata(command);

			const nameLocalized = this.getTranslatedLocalizationMap(metadata.name);
			const descriptionLocalized = this.getTranslatedLocalizationMap(metadata.description);

			const commandMetadata: Record<string, any> = command['meta'];
			commandMetadata.nameLocalizations = nameLocalized;
			commandMetadata.descriptionLocalizations = descriptionLocalized;
		}
	}

	private getLocalizationMetadata(
		command: CommandDiscovery
	): Record<string, string | LocalizationMap> {
		const name = this.reflector.get<string | LocalizationMap>(
			NameTranslations.KEY,
			command.getHandler()
		);
		const description = this.reflector.get<string | LocalizationMap>(
			DescriptionTranslations.KEY,
			command.getHandler()
		);

		return { name, description };
	}

	private getTranslatedLocalizationMap(mapOrString: string | LocalizationMap): LocalizationMap {
		if (!mapOrString) return;

		if (typeof mapOrString === 'string') {
			return Object.values(Locale).reduce((acc, locale) => {
				acc[locale] = this.localizationAdapter.getTranslation(mapOrString, locale);
				return acc;
			}, {});
		}

		return Object.entries(mapOrString).reduce((acc, [locale, value]) => {
			acc[locale] = this.localizationAdapter.getTranslation(value, locale);
			return acc;
		}, {});
	}
}
