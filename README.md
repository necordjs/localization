<div align="center">
   <h1>
       <a href="#"><img src="https://necord.org/img/logo.png"></a>
   </h1>
  🌍 A lightweight Localization module for <b><a href="https://necord.org/">Necord</a></b>
   <br/><br/>
   <a href="https://necord.org">Documentation ✨</a> &emsp; <a href="https://github.com/SocketSomeone/necord">Source code 🪡</a> &emsp; <a href="https://github.com/necordjs/samples">Examples 🛠️</a> &emsp; <a href="https://discord.gg/mcBYvMTnwP">Community 💬</a>
</div>


<br/>

<p align="center">
    <a href='https://img.shields.io/npm/v/necord'><img src="https://img.shields.io/npm/v/necord" alt="NPM Version" /></a>
    <a href='https://img.shields.io/npm/l/necord'><img src="https://img.shields.io/npm/l/necord" alt="NPM License" /></a>
    <a href='https://img.shields.io/npm/dm/necord'><img src="https://img.shields.io/npm/dm/necord" alt="NPM Downloads" /></a>
    <a href='https://img.shields.io/github/last-commit/necordjs/necord'><img src="https://img.shields.io/github/last-commit/SocketSomeone/necord" alt="Last commit" /></a>
</p>

## About

`@necord/localization` is a lightweight localization module for [Necord](https://necord.org/). It allows you to easily localize your bot's
commands and messages. The module provides a simple API for managing locales and translations, as well as a powerful localization adapter
system.

## Installation

**Node.js 18.0.0 or newer is required.**

```bash
$ npm i @necord/localization necord discord.js
$ yarn add @necord/localization necord discord.js
$ pnpm add @necord/localization necord discord.js
```

## Usage

Once the installation process is complete, we can import the `NecordLocalizationModule` with your `NecordModule` into the
root `AppModule`:

```typescript
import { NecordModule } from 'necord';
import { Module } from '@nestjs/common';
import { NecordLocalizationModule, DefaultLocalizationAdapter, UserResolver } from '@necord/localization';
import { AppService } from './app.service';

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
        NecordLocalizationModule.forRoot({
            resolvers: UserResolver,
            // Also you can provide class for support injection by @Inject
            adapter: new DefaultLocalizationAdapter({
                fallbackLocale: 'en-US',
                locales: {
                    'en-US': {
                        'commands.ping.name': 'ping',
                        'commands.ping.description': 'Pong!'
                    },
                    ru: {
                        'commands.ping.name': 'пинг',
                        'commands.ping.description': 'Понг!'
                    }
                }
            })
        })
    ],
    providers
})
class AppModule {
}
```
Also, you can create your own localization adapter. Just implement the `LocalizationAdapter` interface:

```typescript
import { BaseLocalizationAdapter } from '@necord/localization';

interface CustomLocalizationOptions {
    fallbackLocale: string;
    locales: Record<string, Record<string, string>>;
}

export class CustomLocalizationAdapter extends BaseLocalizationAdapter<CustomLocalizationOptions> {
    public getTranslation(key: string, locale: string, ...args: any[]): string {
        return `${key} by ${locale}`;
    }
}

```


Then, we can inject the `LOCALIZATION_ADAPTER` into our service and use it to localize our commands and messages:

```typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { DefaultLocalizationAdapter, localizationMapByKey, LOCALIZATION_ADAPTER } from '@necord/localization';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class AppService implements OnModuleInit {
    public constructor(
        @Inject(LOCALIZATION_ADAPTER)
        private readonly localizationAdapter: DefaultLocalizationAdapter
    ) {
    }

    @SlashCommand({
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
}
```

Or you can use `@CurrentTranslate` decorator to get the current translation from context:

```typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { DefaultLocalizationAdapter, CurrentTranslate, TranslationFn, localizationMapByKey } from '@necord/localization';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class AppService implements OnModuleInit {
    @SlashCommand({
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
}
```

Congratulations! You have successfully created your first localized command with Necord!

## Backers

<a href="https://opencollective.com/necord" target="_blank"><img src="https://opencollective.com/necord/backers.svg?width=1000"></a>

## Stay in touch

* Author - [Alexey Filippov](https://t.me/socketsomeone)
* Twitter - [@SocketSomeone](https://twitter.com/SocketSomeone)

## License

[MIT](https://github.com/necordjs/necord/blob/master/LICENSE) © [Alexey Filippov](https://github.com/SocketSomeone)
