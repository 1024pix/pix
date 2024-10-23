/**
 * @typedef {import ('./index.js').HabilitationRepository} HabilitationRepository
 */
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';

/**
 * @param {Object} params
 * @param {HabilitationRepository} params.habilitationRepository
 * @returns {Promise<number>} number of centers impacted
 */
export const removeCentersHabilitationsExceptCLEA = async ({ habilitationRepository } = {}) => {
  return habilitationRepository.deleteAllByComplementaryKey({
    keys: [
      ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
      ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
      ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
    ],
  });
};
