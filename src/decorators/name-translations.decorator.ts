import { Reflector } from '@nestjs/core';
import { LocalizationMap } from 'discord-api-types/v10';

export const NameTranslations = Reflector.createDecorator<string | LocalizationMap>();
