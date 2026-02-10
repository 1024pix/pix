import { randomUUID } from 'node:crypto';
import { PassThrough } from 'node:stream';

import { logger } from '../utils/logger.js';

/**
 * Manages Server-Sent Events (SSE) streams for query visualization dashboard
 */
export class QueryVizEventStream {
  constructor() {
    this.clients = new Set();
  }

  /**
   * Create a new SSE stream for a client
   * @returns {PassThrough} Stream to attach to HTTP response
   */
  createStream() {
    const stream = new PassThrough();
    const client = {
      id: randomUUID(),
      stream,
      createdAt: Date.now(),
    };

    this.clients.add(client);

    // Send initial connection message
    this.#sendToClient(client, {
      type: 'connected',
      clientId: client.id,
      timestamp: Date.now(),
    });

    // Timeout inactive connections after 30 minutes
    const timeout = setTimeout(
      () => {
        logger.info(`[QueryVizEventStream] Closing inactive SSE client: ${client.id}`);
        stream.end();
      },
      30 * 60 * 1000,
    );

    // Cleanup on stream close
    stream.on('close', () => {
      clearTimeout(timeout);
      this.clients.delete(client);
      logger.info(`[QueryVizEventStream] Client disconnected: ${client.id} (${this.clients.size} clients remaining)`);
    });

    // Handle stream errors
    stream.on('error', (error) => {
      logger.warn(`[QueryVizEventStream] Stream error for client ${client.id}:`, error.message);
      this.clients.delete(client);
    });

    logger.info(`[QueryVizEventStream] Client connected: ${client.id} (${this.clients.size} total clients)`);

    return stream;
  }

  /**
   * Broadcast a message to all connected clients
   * @param {Object} data - Data to broadcast
   */
  broadcast(data) {
    const message = this.#formatSSEMessage(data);
    const deadClients = new Set();

    for (const client of this.clients) {
      try {
        client.stream.write(message);
      } catch (error) {
        logger.warn(`[QueryVizEventStream] Error broadcasting to client ${client.id}:`, error.message);
        deadClients.add(client);
      }
    }

    // Remove dead clients
    for (const client of deadClients) {
      this.clients.delete(client);
      try {
        client.stream.end();
      } catch (error) {
        // Ignore errors when closing dead streams
      }
    }

    if (deadClients.size > 0) {
      logger.info(`[QueryVizEventStream] Removed ${deadClients.size} dead clients`);
    }
  }

  /**
   * Send a message to a specific client
   * @param {Object} client - Client object
   * @param {Object} data - Data to send
   */
  #sendToClient(client, data) {
    try {
      const message = this.#formatSSEMessage(data);
      client.stream.write(message);
    } catch (error) {
      logger.warn(`[QueryVizEventStream] Error sending to client ${client.id}:`, error.message);
      this.clients.delete(client);
    }
  }

  /**
   * Format data as SSE message
   * SSE format: "data: {json}\n\n"
   * @param {Object} data - Data to format
   * @returns {string} Formatted SSE message
   */
  #formatSSEMessage(data) {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  /**
   * Get count of connected clients
   * @returns {number} Number of active clients
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Close all client connections
   */
  closeAll() {
    logger.info(`[QueryVizEventStream] Closing all ${this.clients.size} client connections`);

    for (const client of this.clients) {
      try {
        client.stream.end();
      } catch (error) {
        // Ignore errors when closing
      }
    }

    this.clients.clear();
  }

  /**
   * Send a ping to keep connections alive
   */
  ping() {
    this.broadcast({
      type: 'ping',
      timestamp: Date.now(),
    });
  }
}
