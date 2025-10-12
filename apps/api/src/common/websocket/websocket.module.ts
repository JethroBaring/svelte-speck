// src/common/websocket/websocket.module.ts
import { Global, Module } from '@nestjs/common';
import { WebSocketUtilsService } from './websocket-utils.service';

/**
 * Global WebSocket utilities module.
 * Provides common WebSocket operations to all gateways.
 */
@Global()
@Module({
  providers: [WebSocketUtilsService],
  exports: [WebSocketUtilsService],
})
export class WebSocketModule {}

