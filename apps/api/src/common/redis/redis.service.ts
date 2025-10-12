// src/common/redis/redis.service.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisMessageHandler = (channel: string, message: string) => void | Promise<void>;

/**
 * Generic Redis service providing core pub/sub, caching, and locking functionality.
 * This service is designed to be reusable across different features and modules.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private publisher: Redis;
  private subscriber: Redis;
  private messageHandlers: Map<string, Set<RedisMessageHandler>> = new Map();

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    // Set up global message handler
    this.subscriber.on('message', this.handleRedisMessage.bind(this));
    
    this.logger.log('Redis service initialized');
  }

  async onModuleDestroy() {
    await this.subscriber.disconnect();
    await this.publisher.disconnect();
    this.logger.log('Redis connections closed');
  }

  /**
   * Subscribe to one or more Redis channels
   */
  async subscribe(channels: string | string[]): Promise<void> {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    await this.subscriber.subscribe(...channelArray);
    this.logger.log(`Subscribed to channels: ${channelArray.join(', ')}`);
  }

  /**
   * Unsubscribe from one or more Redis channels
   */
  async unsubscribe(channels: string | string[]): Promise<void> {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    await this.subscriber.unsubscribe(...channelArray);
    this.logger.log(`Unsubscribed from channels: ${channelArray.join(', ')}`);
  }

  /**
   * Register a message handler for specific channels
   * Multiple handlers can be registered for the same channel
   */
  registerMessageHandler(handler: RedisMessageHandler, channels?: string[]): void {
    if (channels) {
      channels.forEach(channel => {
        if (!this.messageHandlers.has(channel)) {
          this.messageHandlers.set(channel, new Set());
        }
        this.messageHandlers.get(channel)!.add(handler);
      });
    } else {
      // Register as a global handler (receives all messages)
      if (!this.messageHandlers.has('*')) {
        this.messageHandlers.set('*', new Set());
      }
      this.messageHandlers.get('*')!.add(handler);
    }
  }

  /**
   * Unregister a message handler
   */
  unregisterMessageHandler(handler: RedisMessageHandler, channels?: string[]): void {
    if (channels) {
      channels.forEach(channel => {
        this.messageHandlers.get(channel)?.delete(handler);
      });
    } else {
      this.messageHandlers.get('*')?.delete(handler);
    }
  }

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: string | object): Promise<void> {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    await this.publisher.publish(channel, messageStr);
  }

  /**
   * Handle incoming Redis messages and dispatch to registered handlers
   */
  private async handleRedisMessage(channel: string, message: string): Promise<void> {
    try {
      // Call channel-specific handlers
      const channelHandlers = this.messageHandlers.get(channel);
      if (channelHandlers) {
        for (const handler of channelHandlers) {
          await handler(channel, message);
        }
      }

      // Call global handlers
      const globalHandlers = this.messageHandlers.get('*');
      if (globalHandlers) {
        for (const handler of globalHandlers) {
          await handler(channel, message);
        }
      }
    } catch (error) {
      this.logger.error(`Error handling Redis message on channel ${channel}:`, error);
    }
  }

  // ============ Caching Methods ============

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.publisher.setex(key, ttlSeconds, valueStr);
    } else {
      await this.publisher.set(key, valueStr);
    }
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.publisher.get(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      // If parsing fails, return as string
      return data as any;
    }
  }

  /**
   * Delete one or more keys from cache
   */
  async delete(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    await this.publisher.del(...keyArray);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.publisher.exists(key);
    return result === 1;
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.publisher.expire(key, ttlSeconds);
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    return await this.publisher.ttl(key);
  }

  // ============ Locking Methods ============

  /**
   * Acquire a distributed lock
   * Returns true if lock was acquired, false otherwise
   */
  async acquireLock(lockKey: string, ttlSeconds: number = 300): Promise<boolean> {
    const result = await this.publisher.set(
      lockKey,
      'locked',
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(lockKey: string): Promise<void> {
    await this.publisher.del(lockKey);
  }

  /**
   * Execute a function with a distributed lock
   * Automatically acquires and releases the lock
   */
  async withLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T | null> {
    const acquired = await this.acquireLock(lockKey, ttlSeconds);
    if (!acquired) {
      this.logger.warn(`Failed to acquire lock: ${lockKey}`);
      return null;
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  // ============ Advanced Operations ============

  /**
   * Get multiple keys at once
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    const values = await this.publisher.mget(...keys);
    return values.map(value => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    });
  }

  /**
   * Set multiple keys at once
   */
  async mset(keyValues: Record<string, any>): Promise<void> {
    const args: string[] = [];
    for (const [key, value] of Object.entries(keyValues)) {
      args.push(key);
      args.push(typeof value === 'string' ? value : JSON.stringify(value));
    }
    await this.publisher.mset(args);
  }

  /**
   * Increment a counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    return await this.publisher.incrby(key, by);
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string, by: number = 1): Promise<number> {
    return await this.publisher.decrby(key, by);
  }

  /**
   * Get keys matching a pattern
   * WARNING: Use with caution in production, can be slow with many keys
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.publisher.keys(pattern);
  }
}

