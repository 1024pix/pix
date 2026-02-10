import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { QueryData } from '../../../monitoring/domain/models/QueryData.js';
import { QueryRequestData } from '../../../monitoring/domain/models/QueryRequestData.js';
import { config } from '../../config.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { getInContext } from '../execution-context-manager.js';
import { logger } from '../utils/logger.js';

/**
 * Circular buffer for fixed-size request history
 */
class CircularBuffer {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.buffer = new Array(maxSize);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.maxSize;

    if (this.size < this.maxSize) {
      this.size++;
    } else {
      // Evict oldest
      this.tail = (this.tail + 1) % this.maxSize;
    }
  }

  toArray() {
    if (this.size === 0) return [];

    const result = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.tail + i) % this.maxSize;
      result.push(this.buffer[index]);
    }
    return result;
  }

  clear() {
    this.buffer = new Array(this.maxSize);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}

/**
 * Singleton tracker for database query visualization
 */
export class QueryTracker {
  static #instance = null;

  constructor(options = {}) {
    if (QueryTracker.#instance) {
      throw new Error('QueryTracker is a singleton. Use QueryTracker.getInstance()');
    }

    this.enabled = false;
    this.maxRequests = options.maxRequests || 100;
    this.maxQueriesPerRequest = options.maxQueriesPerRequest || 1000;
    this.slowQueryThresholdMs = options.slowQueryThresholdMs || 50;

    // Active requests being tracked (Map: requestId -> QueryRequestData)
    this.requestQueries = new Map();

    // Historical requests (circular buffer)
    this.requestHistory = new CircularBuffer(this.maxRequests);

    // Event stream for SSE (will be injected)
    this.eventStream = null;

    // Cleanup interval for orphaned requests
    this.cleanupInterval = null;

    QueryTracker.#instance = this;
  }

  static getInstance() {
    if (!QueryTracker.#instance) {
      const options = config.queryVisualization || {};
      QueryTracker.#instance = new QueryTracker(options);
    }
    return QueryTracker.#instance;
  }

  /**
   * Enable tracking and start cleanup interval
   */
  enable() {
    if (this.enabled) return;

    this.enabled = true;
    logger.info('[QueryTracker] Query visualization enabled');

    // Start cleanup interval for orphaned requests (check every minute)
    this.cleanupInterval = setInterval(() => {
      this.#cleanupOrphanedRequests();
    }, 60000);
  }

  /**
   * Disable tracking and stop cleanup interval
   */
  disable() {
    if (!this.enabled) return;

    this.enabled = false;
    logger.info('[QueryTracker] Query visualization disabled');

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Set event stream for SSE broadcasting
   */
  setEventStream(eventStream) {
    this.eventStream = eventStream;
  }

  /**
   * Called when HTTP request starts
   */
  onRequestStart({ requestId, routePath, method }) {
    if (!this.enabled) return;

    const startTime = performance.now();

    const requestData = new QueryRequestData({
      requestId,
      routePath,
      method,
      startTime,
    });

    this.requestQueries.set(requestId, requestData);

    logger.debug(`[QueryTracker] Request started: ${method} ${routePath} (${requestId})`);
  }

  /**
   * Called when query starts (Knex 'query' event)
   */
  onQueryStart(knexData, context = {}) {
    if (!this.enabled) return;

    const request = getInContext('request');
    if (!request) {
      // No HTTP request context (e.g., startup queries, migrations)
      // This is normal and expected, silently skip
      return;
    }

    const requestId = request.headers?.['x-request-id'];
    if (!requestId) {
      logger.warn('[QueryTracker] No request ID in request headers');
      return;
    }

    const requestData = this.requestQueries.get(requestId);
    if (!requestData) {
      logger.warn(`[QueryTracker] No request data for ${requestId}`, {
        requestId,
        route: request.route?.path,
      });
      return;
    }

    // Check if we've exceeded max queries per request
    if (requestData.queries.length >= this.maxQueriesPerRequest) {
      logger.warn(`[QueryTracker] Max queries per request exceeded for ${requestId}`);
      return;
    }

    const queryId = knexData.__knexQueryUid;
    const startTime = performance.now();

    // Detect transaction context
    const transactionInfo = this.#detectTransaction();

    // Create query data
    const queryData = new QueryData({
      queryId,
      sql: knexData.sql,
      bindings: knexData.bindings || [],
      startTime,
      pool: context.pool || context.database || 'db',
      isTransaction: transactionInfo.isTransaction,
      transactionId: transactionInfo.transactionId,
      executionOrder: requestData.queries.length,
    });

    // Detect parallel execution
    this.#detectParallelExecution(queryData, requestData.queries);

    // Add to request
    requestData.addQuery(queryData);

    // Track transaction boundaries
    if (transactionInfo.isTransaction) {
      const sqlUpper = knexData.sql.toUpperCase().trim();
      if (sqlUpper.startsWith('BEGIN') || sqlUpper.includes('START TRANSACTION')) {
        requestData.addTransactionBoundary(transactionInfo.transactionId, 'BEGIN', startTime);
      }
    }

    logger.debug(`[QueryTracker] Query started: ${queryId} in request ${requestId}`);
  }

  /**
   * Called when query completes (Knex 'query-response' event)
   */
  onQueryEnd(queryId, response) {
    if (!this.enabled) return;

    const request = getInContext('request');
    if (!request) return;

    const requestId = request.headers?.['x-request-id'];
    if (!requestId) return;

    const requestData = this.requestQueries.get(requestId);
    if (!requestData) return;

    // Find the query
    const query = requestData.queries.find((q) => q.queryId === queryId);
    if (!query) {
      logger.warn(`[QueryTracker] Query ${queryId} not found in request ${requestId}`);
      return;
    }

    // Mark as completed
    query.endTime = performance.now();
    query.calculateDuration();

    // Detect transaction boundaries
    if (query.isTransaction) {
      const sqlUpper = query.sql.toUpperCase().trim();
      if (sqlUpper.startsWith('COMMIT')) {
        requestData.addTransactionBoundary(query.transactionId, 'COMMIT', query.endTime);
      }
    }

    logger.debug(`[QueryTracker] Query completed: ${queryId} (${query.duration.toFixed(2)}ms)`);
  }

  /**
   * Called when query has an error (Knex 'query-error' event)
   */
  onQueryError(queryId, error) {
    if (!this.enabled) return;

    const request = getInContext('request');
    if (!request) return;

    const requestId = request.headers?.['x-request-id'];
    if (!requestId) return;

    const requestData = this.requestQueries.get(requestId);
    if (!requestData) return;

    const query = requestData.queries.find((q) => q.queryId === queryId);
    if (!query) return;

    query.endTime = performance.now();
    query.calculateDuration();
    query.error = {
      message: error.message,
      code: error.code,
    };

    // Check for transaction rollback
    if (query.isTransaction && error.code === '25P02') {
      // in_failed_sql_transaction
      requestData.addTransactionBoundary(query.transactionId, 'ROLLBACK', query.endTime);
    }

    logger.debug(`[QueryTracker] Query error: ${queryId} - ${error.message}`);
  }

  /**
   * Called when HTTP request completes
   */
  onRequestEnd(requestId, { poolMetrics, statusCode }) {
    if (!this.enabled) return;

    const requestData = this.requestQueries.get(requestId);
    if (!requestData) {
      logger.warn(`[QueryTracker] Request ${requestId} not found in active requests`);
      return;
    }

    const endTime = performance.now();
    requestData.complete(endTime, poolMetrics, statusCode);

    // Move to history
    this.requestHistory.push(requestData);

    // Remove from active tracking
    this.requestQueries.delete(requestId);

    // Broadcast via SSE
    if (this.eventStream) {
      this.eventStream.broadcast({
        type: 'request-complete',
        data: requestData.toJSON(),
        timestamp: Date.now(),
      });
    }

    const duration = requestData.getDuration();
    const stats = requestData.getStats();

    logger.info(
      `[QueryTracker] Request completed: ${requestData.method} ${requestData.routePath} ` +
        `(${duration?.toFixed(2)}ms, ${stats.totalQueries} queries, ${stats.parallelQueries} parallel)`,
    );
  }

  /**
   * Get all tracked requests (historical + active)
   */
  getAllRequests() {
    const historical = this.requestHistory.toArray();
    const active = Array.from(this.requestQueries.values());

    return [...historical, ...active.map((r) => r.toJSON())];
  }

  /**
   * Clear all tracked data
   */
  clear() {
    this.requestQueries.clear();
    this.requestHistory.clear();
    logger.info('[QueryTracker] All tracked data cleared');
  }

  /**
   * Get statistics about current state
   */
  getStats() {
    return {
      enabled: this.enabled,
      activeRequests: this.requestQueries.size,
      historicalRequests: this.requestHistory.size,
      maxRequests: this.maxRequests,
      maxQueriesPerRequest: this.maxQueriesPerRequest,
      slowQueryThresholdMs: this.slowQueryThresholdMs,
    };
  }

  /**
   * Detect if current query is in a transaction
   */
  #detectTransaction() {
    try {
      const connection = DomainTransaction.getConnection();
      const isTransaction = connection.isTransaction !== undefined;

      if (isTransaction) {
        // Generate or retrieve transaction ID
        const txId = connection.__pix__transactionId || (connection.__pix__transactionId = randomUUID());

        return {
          isTransaction: true,
          transactionId: txId,
        };
      }
    } catch (error) {
      logger.debug('[QueryTracker] Error detecting transaction:', error.message);
    }

    return {
      isTransaction: false,
      transactionId: null,
    };
  }

  /**
   * Detect if query is executing in parallel with previous queries
   */
  #detectParallelExecution(currentQuery, previousQueries) {
    if (previousQueries.length === 0) return;

    const lastQuery = previousQueries[previousQueries.length - 1];

    // If the last query hasn't completed yet, current query is parallel
    if (lastQuery.endTime === null) {
      // Assign to same parallel group, or create new group
      currentQuery.parallelGroup =
        lastQuery.parallelGroup !== null ? lastQuery.parallelGroup : lastQuery.executionOrder;
    }
  }

  /**
   * Cleanup requests that never completed (timeout: 5 minutes)
   */
  #cleanupOrphanedRequests() {
    const now = performance.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [requestId, requestData] of this.requestQueries.entries()) {
      if (now - requestData.startTime > timeout) {
        logger.warn(`[QueryTracker] Orphaned request detected: ${requestId}`);

        // Move to history as-is
        this.requestHistory.push(requestData);
        this.requestQueries.delete(requestId);
      }
    }
  }
}

// Auto-initialize if enabled
if (config.queryVisualization?.enabled) {
  const tracker = QueryTracker.getInstance();
  tracker.enable();
}
