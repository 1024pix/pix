class JobPgBoss {
  constructor(config, queryBuilder) {
    this.name = config.name;
    this.retryLimit = config.retryLimit || 0;
    this.retryDelay = config.retryDelay || 30;
    this.queryBuilder = queryBuilder;
  }

  async schedule(data) {
    await this.queryBuilder.raw(
      'INSERT INTO pgboss.job (name, data, retryLimit, retryDelay) VALUES (:name, :data, :retryLimit, :retryDelay)',
      {
        name: this.name,
        retryLimit: this.retryLimit,
        retryDelay: this.retryDelay,
        data,
      }
    );
  }
}

module.exports = JobPgBoss;
