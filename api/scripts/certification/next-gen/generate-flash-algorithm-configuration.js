import * as url from 'node:url';

import * as flashAlgorithmConfigurationRepository from '../../../src/certification/flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import { executeScript } from '../../tooling/tooling.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
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
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();

export { main };
