const RepeatableQueue = require('../RepeatableQueue');
const config = require('../../../config');

class DatabaseStatisticsCollectionQueue extends RepeatableQueue {
  constructor({ job, name, redisUrl, version }) {
    super({ job, name, redisUrl, version });
    this._options = {
      attempts: 3,
      repeat: {
        cron: config.scheduledJobs.databaseStatisticsCollection.cron,
      },
      jobId: this._currentVersion,
    };
  }

  get isEnabled() {
    return config.scheduledJobs.databaseStatisticsCollection.enabled;
  }
}

module.exports = new DatabaseStatisticsCollectionQueue({
  job: require('./job'),
  name: 'database-statistics-collection-queue',
  redisUrl: config.scheduledJobs.redisUrl,
  version: config.scheduledJobs.databaseStatisticsCollection.version,
});
