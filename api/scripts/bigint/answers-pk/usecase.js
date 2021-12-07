const logger = require('../../../lib/infrastructure/logger');
const waitForThatMilliseconds = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const externalSettings = { POLLING_INTERVAL_SECONDS: 60 };

const migrate = async (settingsRepository, answerRepository) => {
  if (!(await settingsRepository.isScheduled())) {
    throw new Error(`Migration is not scheduled, exiting..`);
  }

  const { startAt, endAt } = await settingsRepository.migrationInterval();

  if (startAt === endAt) {
    throw new Error('All rows have already been migrated, exiting..');
  }

  let chunkSize = await settingsRepository.chunkSize();
  let chunkStartId = startAt;

  while (chunkStartId <= endAt) {
    let chunkEndId = chunkStartId + chunkSize - 1;
    if (chunkEndId > endAt) {
      chunkEndId = endAt;
    }
    logger.info(`Migrating answers from  ${chunkStartId} from ${chunkEndId}`);
    await answerRepository.copyIntIdToBigintId({ startAt: chunkStartId, endAt: chunkEndId });
    await settingsRepository.markRowsAsMigrated(chunkEndId);
    const pauseMilliseconds = await settingsRepository.pauseInterval();

    if (pauseMilliseconds !== 0) {
      logger.info(`Sleeping for ${pauseMilliseconds} milliseconds...`);
      await waitForThatMilliseconds(pauseMilliseconds);
    }

    logger.info('Checking if still scheduled..');
    while (!(await settingsRepository.isScheduled())) {
      logger.info(`Not scheduled any more, next polling in ${externalSettings.POLLING_INTERVAL_SECONDS} second(s) ..`);
      await waitForThatMilliseconds(externalSettings.POLLING_INTERVAL_SECONDS * 1000);
    }
    logger.info('Still scheduled, going on to next batch..');
    chunkStartId = chunkStartId + chunkSize;
    chunkSize = await settingsRepository.chunkSize();
  }
  logger.info('Migration completed');
};

module.exports = {
  migrate,
  externalSettings,
};
