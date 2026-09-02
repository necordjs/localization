import { createParamDecorator } from '@nestjs/common';

import { LocalizationInterceptor } from '../interceptors/index.js';

export const CurrentTranslate = createParamDecorator(() =>
	LocalizationInterceptor.getCurrentTranslationFn()
);
