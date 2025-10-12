// src/common/websocket/websocket-utils.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketMessage, ErrorEvent } from './websocket-base.types';

/**
 * Utility service providing common WebSocket operations.
 * Can be used by any feature-specific gateway.
 */
@Injectable()
export class WebSocketUtilsService {
  private readonly logger = new Logger(WebSocketUtilsService.name);

  /**
   * Safely join a room with logging and error handling
   */
  async joinRoom(
    client: Socket,
    roomName: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    try {
      await client.join(roomName);
      this.logger.log(
        `Client ${client.id} joined room ${roomName}${metadata ? ` with metadata: ${JSON.stringify(metadata)}` : ''}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to join room ${roomName} for client ${client.id}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Safely leave a room with logging
   */
  async leaveRoom(client: Socket, roomName: string): Promise<void> {
    try {
      await client.leave(roomName);
      this.logger.log(`Client ${client.id} left room ${roomName}`);
    } catch (error) {
      this.logger.error(
        `Failed to leave room ${roomName} for client ${client.id}:`,
        error,
      );
    }
  }

  /**
   * Emit a typed message to a specific room
   */
  emitToRoom<T = any>(
    server: Server,
    roomName: string,
    event: string,
    data: T,
  ): void {
    const message: WebSocketMessage<T> = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
    };

    server.to(roomName).emit(event, message);
    this.logger.debug(`Emitted ${event} to room ${roomName}`);
  }

  /**
   * Emit a typed message to a specific client
   */
  emitToClient<T = any>(
    client: Socket,
    event: string,
    data: T,
  ): void {
    const message: WebSocketMessage<T> = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
    };

    client.emit(event, message);
    this.logger.debug(`Emitted ${event} to client ${client.id}`);
  }

  /**
   * Broadcast to all clients except sender
   */
  broadcastToRoom<T = any>(
    client: Socket,
    roomName: string,
    event: string,
    data: T,
  ): void {
    const message: WebSocketMessage<T> = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
    };

    client.to(roomName).emit(event, message);
    this.logger.debug(
      `Broadcasted ${event} to room ${roomName} (excluding sender)`,
    );
  }

  /**
   * Send error to client
   */
  sendError(
    client: Socket,
    error: string | Error,
    code?: string,
    details?: any,
  ): void {
    const errorData: ErrorEvent = {
      error: typeof error === 'string' ? error : error.message,
      code,
      details,
    };

    this.emitToClient(client, 'error', errorData);
  }

  /**
   * Send error to room
   */
  sendErrorToRoom(
    server: Server,
    roomName: string,
    error: string | Error,
    code?: string,
    details?: any,
  ): void {
    const errorData: ErrorEvent = {
      error: typeof error === 'string' ? error : error.message,
      code,
      details,
    };

    this.emitToRoom(server, roomName, 'error', errorData);
  }

  /**
   * Get all rooms a client is in
   */
  getClientRooms(client: Socket): string[] {
    return Array.from(client.rooms).filter((room) => room !== client.id);
  }

  /**
   * Get number of clients in a room
   */
  getRoomSize(server: Server, roomName: string): number {
    const room = server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }

  /**
   * Check if a client is in a room
   */
  isClientInRoom(client: Socket, roomName: string): boolean {
    return client.rooms.has(roomName);
  }

  /**
   * Leave all rooms for a client
   */
  async leaveAllRooms(client: Socket): Promise<void> {
    const rooms = this.getClientRooms(client);
    for (const room of rooms) {
      await this.leaveRoom(client, room);
    }
  }
}

