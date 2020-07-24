const logger = require('../../logger');
const config = require('../../../config');
const statsTableSizeProbeRepository = require('../../repositories/stats-table-size-probe-repository');

async function collectDatabaseStatistics(job) {
  logger.info('Collecting database statistics...');

  if (job.data.version !== config.scheduledJobs.databaseStatisticsCollection.version) {
    logger.info('Not appropriate version, retrying...');
    return job.retry();
  }

  await statsTableSizeProbeRepository.collect();

  logger.info('Collecting database statistics OK');
  return Promise.resolve();
}

module.exports = collectDatabaseStatistics;
