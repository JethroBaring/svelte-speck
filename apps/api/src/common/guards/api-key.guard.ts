// src/common/guards/api-key.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_KEY_AUTH } from '../decorators/api-key.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const useApiKey = this.reflector.getAllAndOverride<boolean>(API_KEY_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!useApiKey) return true;

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // compare with env variable
    if (apiKey !== process.env.WORKER_API_KEY) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
