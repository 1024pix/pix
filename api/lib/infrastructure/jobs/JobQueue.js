const DomainTransaction = require('../DomainTransaction');

class JobQueue {
  constructor(pgBoss, dependenciesBuilder) {
    this.pgBoss = pgBoss;
    this.dependenciesBuilder = dependenciesBuilder;
  }

  performJob(name, handlerClass) {
    this.pgBoss.work(name, (job) => {
      const promise = DomainTransaction.execute(async (domainTransaction) => {
        const handler = this.dependenciesBuilder.build(handlerClass, domainTransaction);
        await handler.handle(job.data);
      });

      promise.then(() => job.done()).catch((error) => job.done(error));
      return promise;
    });
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000 });
  }
}

module.exports = JobQueue;
