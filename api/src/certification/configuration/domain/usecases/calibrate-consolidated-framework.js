/**
 * @typedef {import ('./index.js').ConsolidatedFrameworkRepository} ConsolidatedFrameworkRepository
 * @typedef {import ('./index.js').ActiveCalibratedChallengeRepository} ActiveCalibratedChallengeRepository
 * @typedef {import ('../models/ConsolidatedFramework.js').ConsolidatedFramework} ConsolidatedFramework
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import ('../models/CertificationFrameworksChallenge.js').CertificationFrameworksChallenge} CertificationFrameworksChallenge
 * @typedef {import ('../read-models/ActiveCalibratedChallenge.js').ActiveCalibratedChallenge} ActiveCalibratedChallenge
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as injectedActiveCalibratedChallengeRepository from '../../infrastructure/repositories/active-calibrated-challenge-repository.js';
import * as injectedConsolidatedFrameworkRepository from '../../infrastructure/repositories/consolidated-framework-repository.js';

export const calibrateConsolidatedFramework = withTransaction(
  /**
   * @param {Object} params
   * @param {String} params.version
   * @param {number} params.calibrationId
   * @param {ComplementaryCertificationKeys} params.complementaryCertificationKey
   * @param {ConsolidatedFrameworkRepository} params.consolidatedFrameworkRepository
   * @param {ActiveCalibratedChallengeRepository} params.activeCalibratedChallengeRepository
   * @returns {Promise<void>}
   */
  async ({
    version,
    calibrationId,
    complementaryCertificationKey,
    consolidatedFrameworkRepository = injectedConsolidatedFrameworkRepository,
    activeCalibratedChallengeRepository = injectedActiveCalibratedChallengeRepository,
  } = {}) => {
    const consolidatedFramework = await consolidatedFrameworkRepository.getByVersionAndComplementaryKey({
      complementaryCertificationKey,
      version,
    });

    const activeCalibratedChallenges = await activeCalibratedChallengeRepository.getByComplementaryKeyAndCalibrationId({
      complementaryCertificationKey,
      calibrationId,
    });

    _calibrateConsolidatedFramework({
      consolidatedFramework,
      calibrationId,
      activeCalibratedChallenges,
    });

    return consolidatedFrameworkRepository.save(consolidatedFramework);
  },
);

/**
 * @param {Array<ActiveCalibratedChallenge>} activeCalibratedChallenges
 * @param {Array<CertificationFrameworksChallenge>} challengesToCalibrate
 */
const _calibrateConsolidatedFramework = ({ consolidatedFramework, calibrationId, activeCalibratedChallenges }) => {
  consolidatedFramework.calibrationId = calibrationId;
  for (let source = 0, target = 0; source < activeCalibratedChallenges.length; source++, target++) {
    while (activeCalibratedChallenges[source].challengeId !== consolidatedFramework.challenges[target]?.challengeId) {
      if (!consolidatedFramework.challenges[target]) {
        throw new NotFoundError(
          `The challenge ${activeCalibratedChallenges[source].challengeId} does not exist in the consolidatedFramework challenges`,
        );
      }
      target++;
    }

    const frameworkChallenge = consolidatedFramework.challenges[target];
    frameworkChallenge.calibrate(activeCalibratedChallenges[source]);
  }
};
