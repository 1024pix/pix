/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import('./index.js').SharedChallengeRepository} SharedChallengeRepository
 */

import { challengeRepository as injectedSharedChallengeRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import * as injectedSharedFlashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import { AssessmentSimulator } from '../models/AssessmentSimulator.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../models/AssessmentSimulatorSingleMeasureStrategy.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';
import * as injectedFlashAlgorithmService from '../services/algorithm-methods/flash.js';

/**
 * @param {Object} params
 * @param {ComplementaryCertificationKeys} params.complementaryCertificationKey
 * @param {number} params.stopAtChallenge - force scenario to stop at challenge before maximumAssessmentLength
 * @param {SharedChallengeRepository} params.sharedChallengeRepository
 */
export async function simulateFlashAssessmentScenario({
  locale,
  pickChallenge,
  pickAnswerStatus,
  initialCapacity,
  variationPercent,
  flashAlgorithmService = injectedFlashAlgorithmService,
  sharedFlashAlgorithmConfigurationRepository = injectedSharedFlashAlgorithmConfigurationRepository,
  complementaryCertificationRepository,
  sharedChallengeRepository = injectedSharedChallengeRepository,
  accessibilityAdjustmentNeeded,
  complementaryCertificationKey,
  stopAtChallenge,
} = {}) {
  if (complementaryCertificationKey) {
    return _simulateComplementaryCertificationScenario({
      complementaryCertificationKey,
      challengeRepository: sharedChallengeRepository,
      complementaryCertificationRepository,
      flashAlgorithmService,
      sharedFlashAlgorithmConfigurationRepository,
      pickChallenge,
      pickAnswerStatus,
      initialCapacity,
      variationPercent,
      locale,
      stopAtChallenge,
    });
  } else {
    return _simulateCoreCertificationScenario({
      locale,
      accessibilityAdjustmentNeeded,
      challengeRepository: sharedChallengeRepository,
      flashAlgorithmService,
      sharedFlashAlgorithmConfigurationRepository,
      pickChallenge,
      pickAnswerStatus,
      initialCapacity,
      variationPercent,
      stopAtChallenge,
    });
  }
}

/**
 * @param {Object} params
 * @param {SharedChallengeRepository} params.challengeRepository
 */
async function _simulateComplementaryCertificationScenario({
  locale,
  complementaryCertificationKey,
  pickChallenge,
  pickAnswerStatus,
  initialCapacity,
  variationPercent,
  challengeRepository,
  flashAlgorithmService,
  sharedFlashAlgorithmConfigurationRepository,
  stopAtChallenge,
}) {
  const challenges = await _getChallenges({
    locale,
    challengeRepository,
    complementaryCertificationKey,
  });

  const mostRecentAlgorithmConfiguration = await sharedFlashAlgorithmConfigurationRepository.getMostRecent();

  return _simulation({
    challenges,
    mostRecentAlgorithmConfiguration,
    flashAlgorithmService,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
    variationPercent,
    stopAtChallenge,
  });
}

/**
 * @param {Object} params
 * @param {SharedChallengeRepository} params.challengeRepository
 */
async function _simulateCoreCertificationScenario({
  pickChallenge,
  pickAnswerStatus,
  initialCapacity,
  variationPercent,
  challengeRepository,
  sharedFlashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  locale,
  accessibilityAdjustmentNeeded,
  stopAtChallenge,
}) {
  const challenges = await _getChallenges({
    challengeRepository,
    locale,
    accessibilityAdjustmentNeeded,
  });

  const mostRecentAlgorithmConfiguration = await sharedFlashAlgorithmConfigurationRepository.getMostRecent();

  return _simulation({
    challenges,
    mostRecentAlgorithmConfiguration,
    flashAlgorithmService,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
    variationPercent,
    stopAtChallenge,
  });
}

/**
 * @param {Object} params
 * @param {SharedChallengeRepository} params.challengeRepository
 */
function _getChallenges({ challengeRepository, locale, accessibilityAdjustmentNeeded, complementaryCertificationKey }) {
  return challengeRepository.findActiveFlashCompatible({
    locale,
    accessibilityAdjustmentNeeded,
    complementaryCertificationKey,
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
