class JobPgBoss {
  constructor(config, queryBuilder) {
    this.name = config.name;
    this.retryLimit = config.retryLimit || 0;
    this.retryDelay = config.retryDelay || 30;
    this.retryBackoff = config.retryBackoff || false;
    this.expireIn = config.expireIn || '00:15:00';
    this.queryBuilder = queryBuilder;
    this.priority = config.priority || 0;
  }

  async schedule(data) {
    await this.queryBuilder('pgboss.job').insert({
      name: this.name,
      retrylimit: this.retryLimit,
      retrydelay: this.retryDelay,
      retrybackoff: this.retryBackoff,
      expirein: this.expireIn,
      data,
      on_complete: true,
      priority: this.priority,
    });
  }

  async performAsync(data) {
    return this.schedule(data);
  }
}

export { JobPgBoss };
