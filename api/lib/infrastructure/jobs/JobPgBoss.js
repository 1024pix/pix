class JobPgBoss {
  constructor(config, queryBuilder) {
    this.name = config.name;
    this.retryLimit = config.retryLimit || 0;
    this.retryDelay = config.retryDelay || 30;
    this.retryBackoff = config.retryBackoff || false;
    this.expireIn = config.expireIn || '00:15:00';
    this.queryBuilder = queryBuilder;
  }

  async schedule(data) {
    await this.queryBuilder.raw(
      'INSERT INTO pgboss.job (name, data, retrylimit, retrydelay, retrybackoff, expirein, on_complete) VALUES (:name, :data, :retryLimit, :retryDelay, :retryBackoff, :expireIn, :on_complete)',
      {
        name: this.name,
        retryLimit: this.retryLimit,
        retryDelay: this.retryDelay,
        retryBackoff: this.retryBackoff,
        expireIn: this.expireIn,
        data,
        on_complete: true,
      },
    );
  }
}

export { JobPgBoss };
