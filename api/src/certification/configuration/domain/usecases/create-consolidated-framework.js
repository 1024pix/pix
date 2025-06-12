/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import ('./index.js').TubeRepository} TubeRepository
 * @typedef {import ('./index.js').SkillRepository} SkillRepository
 * @typedef {import ('./index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import ('./index.js').ConsolidatedFrameworkRepository} ConsolidatedFrameworkRepository
 */

import { LOCALE } from '../../../../shared/domain/constants.js';
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {ComplementaryCertificationKeys} params.complementaryCertificationKey
 * @param {Array<string>} params.tubeIds
 * @param {TubeRepository} params.tubeRepository
 * @param {SkillRepository} params.skillRepository
 * @param {ChallengeRepository} params.challengeRepository
 * @param {ConsolidatedFrameworkRepository} params.consolidatedFrameworkRepository
 */

export const createConsolidatedFramework = withTransaction(
  async ({
    complementaryCertificationKey,
    tubeIds,
    tubeRepository,
    skillRepository,
    challengeRepository,
    uuidService,
    consolidatedFrameworkRepository,
    complementaryCertificationRepository,
  }) => {
    const tubes = await tubeRepository.findActiveByRecordIds(tubeIds, LOCALE.FRENCH_SPOKEN);

    const skillIds = tubes.flatMap((tube) => tube.skillIds);
    const skills = await skillRepository.findActiveByRecordIds(skillIds);

    const challenges = await challengeRepository.findOperativeBySkills(skills, LOCALE.FRENCH_SPOKEN);

    return consolidatedFrameworkRepository.create({
      complementaryCertificationKey,
      challenges,
      uuidService,
      complementaryCertificationRepository,
    });
  },
);
