class JobQueue {
  constructor(pgBoss, dependenciesBuilder) {
    this.pgBoss = pgBoss;
    this.dependenciesBuilder = dependenciesBuilder;
  }

  performJob(name, handlerClass) {
    this.pgBoss.work(name, { teamSize: 10, teamConcurrency: 10 }, async (job) => {
      const handler = this.dependenciesBuilder.build(handlerClass);
      const promise = handler
        .handle(job.data)
        .then(() => job.done())
        .catch((error) => job.done(error));
      return promise;
    });
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000 });
  }
}

module.exports = JobQueue;
