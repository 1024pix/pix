/**
 * Represents metadata for a single database query
 */
export class QueryData {
  constructor({
    queryId,
    sql,
    bindings = [],
    startTime,
    endTime = null,
    duration = null,
    pool,
    isTransaction = false,
    transactionId = null,
    executionOrder,
    parallelGroup = null,
    error = null,
  }) {
    this.queryId = queryId;
    this.sql = sql;
    this.bindings = bindings;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = duration;
    this.pool = pool; // 'db', 'datamart', or 'datawarehouse'
    this.isTransaction = isTransaction;
    this.transactionId = transactionId;
    this.executionOrder = executionOrder;
    this.parallelGroup = parallelGroup;
    this.error = error;
  }

  /**
   * Check if this query executed in parallel with other queries
   */
  isParallel() {
    return this.parallelGroup !== null;
  }

  /**
   * Check if query has completed
   */
  isCompleted() {
    return this.endTime !== null;
  }

  /**
   * Check if query had an error
   */
  hasError() {
    return this.error !== null;
  }

  /**
   * Calculate duration if not already set
   */
  calculateDuration() {
    if (this.duration === null && this.endTime !== null && this.startTime !== null) {
      this.duration = this.endTime - this.startTime;
    }
    return this.duration;
  }

  /**
   * Serialize to JSON for API response
   */
  toJSON() {
    return {
      queryId: this.queryId,
      sql: this.sql,
      bindings: this.bindings,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      pool: this.pool,
      isTransaction: this.isTransaction,
      transactionId: this.transactionId,
      executionOrder: this.executionOrder,
      parallelGroup: this.parallelGroup,
      error: this.error
        ? {
            message: this.error.message,
            code: this.error.code,
          }
        : null,
    };
  }
}
