/**
 * @typedef {import('./index.js').CalibratedChallengeRepository} CalibratedChallengeRepository
 * @typedef {import('./index.js').VersionApi} VersionApi
 */

import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { AssessmentSimulator } from '../models/AssessmentSimulator.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../models/AssessmentSimulatorSingleMeasureStrategy.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';

/**
 * @param {object} params
 * @param {number} params.stopAtChallenge - force scenario to stop at challenge before maximumAssessmentLength
 * @param {CalibratedChallengeRepository} params.calibratedChallengeRepository
 * @param {VersionApi} params.versionApi
 */
export async function simulateFlashAssessmentScenario({
  locale,
  pickChallenge,
  pickAnswerStatus,
  initialCapacity,
  variationPercent,
  flashAlgorithmService,
  accessibilityAdjustmentNeeded,
  stopAtChallenge,
  versionId,
  calibratedChallengeRepository,
  versionApi,
}) {
  const version = await versionApi.getById({ id: versionId });

  return _simulateCertificationScenario({
    locale,
    accessibilityAdjustmentNeeded,
    calibratedChallengeRepository,
    flashAlgorithmService,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
    variationPercent,
    stopAtChallenge,
    version,
  });
}

/**
 * @param {object} params
 * @param {CalibratedChallengeRepository} params.calibratedChallengeRepository
 */
async function _simulateCertificationScenario({
  pickChallenge,
  pickAnswerStatus,
  initialCapacity,
  variationPercent,
  calibratedChallengeRepository,
  flashAlgorithmService,
  locale,
  accessibilityAdjustmentNeeded,
  stopAtChallenge,
  version,
}) {
  let challenges = await calibratedChallengeRepository.findActiveFlashCompatible({
    locale,
    version,
  });

  if (accessibilityAdjustmentNeeded) {
    challenges = challenges.filter((challenge) => challenge.isAccessible);
  }

  return _simulation({
    challenges,
    mostRecentAlgorithmConfiguration: version.challengesConfiguration,
    flashAlgorithmService,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
    variationPercent,
    stopAtChallenge,
  });
}

function _simulation({
  challenges,
  mostRecentAlgorithmConfiguration,
  flashAlgorithmService,
  pickChallenge,
  pickAnswerStatus,
  initialCapacity,
  variationPercent,
  stopAtChallenge,
}) {
  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: new FlashAssessmentAlgorithmConfiguration({
      ...mostRecentAlgorithmConfiguration,
      variationPercent: variationPercent ?? mostRecentAlgorithmConfiguration.variationPercent,
      maximumAssessmentLength: stopAtChallenge ?? mostRecentAlgorithmConfiguration.maximumAssessmentLength,
      defaultCandidateCapacity: initialCapacity ?? mostRecentAlgorithmConfiguration.defaultCandidateCapacity,
    }),
  });

  const singleMeasureStrategy = new AssessmentSimulatorSingleMeasureStrategy({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
  });

  const simulator = new AssessmentSimulator({
    strategy: singleMeasureStrategy,
  });

  return simulator.run();
}
