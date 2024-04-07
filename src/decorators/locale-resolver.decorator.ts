import { Reflector } from '@nestjs/core';
import { LocaleResolvers } from '../enums';

export const LocaleResolver = Reflector.createDecorator<LocaleResolvers>();
