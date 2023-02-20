import { pgBoss } from '../../config';

const { teamSize: teamSize, teamConcurrency: teamConcurrency } = pgBoss;

class JobQueue {
  constructor(pgBoss, dependenciesBuilder) {
    this.pgBoss = pgBoss;
    this.dependenciesBuilder = dependenciesBuilder;
  }

  performJob(name, handlerClass) {
    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
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

export default JobQueue;
