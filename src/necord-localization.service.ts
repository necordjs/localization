import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CommandDiscovery, CommandsService } from 'necord';
import { Locale, LocalizationMap } from 'discord-api-types/v10';
import { LOCALIZATION_ADAPTER } from './providers';
import { DefaultLocalizationAdapter } from './adapters';

@Injectable()
export class NecordLocalizationService implements OnModuleInit {
	public constructor(
		@Inject(LOCALIZATION_ADAPTER)
		private readonly localizationAdapter: DefaultLocalizationAdapter,
		private readonly commandsService: CommandsService
	) {}

	public onModuleInit() {
		const commands = this.commandsService.getCommands().flatMap(command => {
			if (command.isContextMenu()) {
				return command;
			}

			if (!command.isSlashCommand()) {
				return command;
			}

			const rootCommand = command;
			const subcommandGroups = [...rootCommand.getSubcommands().values()];
			const subcommands = subcommandGroups.flatMap(group => [
				...group.getSubcommands().values()
			]);

			return [rootCommand, ...subcommandGroups, ...subcommands] as CommandDiscovery[];
		});

		for (const command of commands) {
			const commandMetadata: Record<string, any> = command['meta'];
			commandMetadata.nameLocalizations = this.getLocalizationMap(
				commandMetadata.nameLocalizations
			);
			commandMetadata.descriptionLocalizations = this.getLocalizationMap(
				commandMetadata.descriptionLocalizations
			);
		}
	}

	private getLocalizationMap(mapOrString: string | LocalizationMap): LocalizationMap {
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
