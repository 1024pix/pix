export class PgBossJobScheduler {
  constructor(config, queryBuilder) {
    this.jobName = config.jobName;
    this.retryLimit = config.retryLimit || 0;
    this.retryDelay = config.retryDelay || 30;
    this.queryBuilder = queryBuilder;
  }

  async schedule(data) {
    await this.queryBuilder.raw(
      'INSERT INTO pgboss.job (name, data, retryLimit, retryDelay, on_complete) VALUES (:name, :data, :retryLimit, :retryDelay, :on_complete)',
      {
        name: this.jobName,
        retryLimit: this.retryLimit,
        retryDelay: this.retryDelay,
        data,
        on_complete: true,
      },
    );
  }
}
