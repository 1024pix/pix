const MonitoredJobHandler = require('./monitoring/MonitoredJobHandler.js');
const logger = require('../logger.js');
const { teamSize, teamConcurrency } = require('../../config.js').pgBoss;
class JobQueue {
  constructor(pgBoss) {
    this.pgBoss = pgBoss;
  }

  performJob(name, handlerClass) {
    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
      const jobHandler = new handlerClass();
      const monitoredJobHandler = new MonitoredJobHandler(jobHandler, logger);
      return monitoredJobHandler
        .handle(job.data)
        .then(() => job.done())
        .catch((error) => job.done(error));
    });
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000 });
  }
}

module.exports = JobQueue;
