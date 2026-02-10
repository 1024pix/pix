/**
 * Represents all database queries associated with a single HTTP request
 */
export class QueryRequestData {
  constructor({
    requestId,
    routePath,
    method,
    startTime,
    endTime = null,
    queries = [],
    transactionBoundaries = [],
    poolMetrics = {},
    statusCode = null,
  }) {
    this.requestId = requestId;
    this.routePath = routePath;
    this.method = method;
    this.startTime = startTime;
    this.endTime = endTime;
    this.queries = queries; // Array of QueryData instances
    this.transactionBoundaries = transactionBoundaries; // Array of {txId, type, timestamp}
    this.poolMetrics = poolMetrics;
    this.statusCode = statusCode;
  }

  /**
   * Add a query to this request
   */
  addQuery(queryData) {
    this.queries.push(queryData);
  }

  /**
   * Record a transaction boundary (BEGIN, COMMIT, ROLLBACK)
   */
  addTransactionBoundary(txId, type, timestamp) {
    this.transactionBoundaries.push({
      txId,
      type, // 'BEGIN', 'COMMIT', or 'ROLLBACK'
      timestamp,
    });
  }

  /**
   * Mark request as completed
   */
  complete(endTime, poolMetrics, statusCode) {
    this.endTime = endTime;
    this.poolMetrics = poolMetrics;
    this.statusCode = statusCode;

    // Calculate duration for all queries
    this.queries.forEach((query) => query.calculateDuration());
  }

  /**
   * Get request duration
   */
  getDuration() {
    if (this.endTime === null || this.startTime === null) {
      return null;
    }
    return this.endTime - this.startTime;
  }

  /**
   * Get statistics about queries
   */
  getStats() {
    const parallelQueries = this.queries.filter((q) => q.isParallel()).length;
    const sequentialQueries = this.queries.length - parallelQueries;
    const totalQueryTime = this.queries.reduce((sum, q) => sum + (q.duration || 0), 0);
    const uniqueTransactions = new Set(this.queries.filter((q) => q.isTransaction).map((q) => q.transactionId)).size;
    const errorCount = this.queries.filter((q) => q.hasError()).length;

    return {
      totalQueries: this.queries.length,
      parallelQueries,
      sequentialQueries,
      totalQueryTime,
      transactions: uniqueTransactions,
      errors: errorCount,
      avgQueryTime: this.queries.length > 0 ? totalQueryTime / this.queries.length : 0,
    };
  }

  /**
   * Serialize to JSON for API response
   */
  toJSON() {
    return {
      requestId: this.requestId,
      routePath: this.routePath,
      method: this.method,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      queries: this.queries.map((q) => q.toJSON()),
      transactionBoundaries: this.transactionBoundaries,
      poolMetrics: this.poolMetrics,
      statusCode: this.statusCode,
      stats: this.getStats(),
    };
  }
}
