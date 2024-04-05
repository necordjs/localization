import { Reflector } from '@nestjs/core';
import { LocalizationMap } from 'discord-api-types/v10';

export const DescriptionTranslations = Reflector.createDecorator<string | LocalizationMap>();
