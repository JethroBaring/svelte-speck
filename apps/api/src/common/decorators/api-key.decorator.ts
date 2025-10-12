// src/common/decorators/api-key.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const API_KEY_AUTH = 'api-key-auth';
export const ApiKey = () => SetMetadata(API_KEY_AUTH, true);
