// src/common/websocket/websocket-base.types.ts

/**
 * Generic WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

/**
 * Generic room event data
 */
export interface RoomEvent {
  room: string;
  clientId: string;
  timestamp: string;
}

/**
 * Generic error event
 */
export interface ErrorEvent {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Base interface for entities that can be subscribed to via rooms
 */
export interface RoomSubscribable {
  getRoomName(): string;
}

/**
 * Generic join room request
 */
export interface JoinRoomRequest {
  roomId: string;
  metadata?: Record<string, any>;
}

/**
 * Generic leave room request
 */
export interface LeaveRoomRequest {
  roomId: string;
}

