import { logger } from '../../../lib/infrastructure/logger.js';
import { disconnect } from '../../../db/knex-database-connection.js';
import * as flashAlgorithmConfigurationRepository from '../../../src/certification/flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as url from 'url';
import { FlashAssessmentAlgorithmConfiguration } from '../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithmConfiguration.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

async function main() {
  logger.info(`Script ${__filename} est lancé !`);

  const configurationData = {
    warmUpLength: null,
    forcedCompetences: [],
    maximumAssessmentLength: 32,
    challengesBetweenSameCompetence: null,
    minimumEstimatedSuccessRateRanges: [],
    limitToOneQuestionPerTube: true,
    enablePassageByAllCompetences: true,
    doubleMeasuresUntil: null,
    variationPercent: 0.5,
    variationPercentUntil: null,
  };

  const configuration = new FlashAssessmentAlgorithmConfiguration(configurationData);

  await flashAlgorithmConfigurationRepository.save(configuration);

  logger.info('La configuration a été créée.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
