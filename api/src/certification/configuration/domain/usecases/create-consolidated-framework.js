/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import ('./index.js').TubeRepository} TubeRepository
 * @typedef {import ('./index.js').SkillRepository} SkillRepository
 * @typedef {import ('./index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import ('./index.js').ConsolidatedFrameworkRepository} ConsolidatedFrameworkRepository
 */

import { FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import * as injectedChallengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedSkillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as injectedTubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import * as injectedConsolidatedFrameworkRepository from '../../infrastructure/repositories/consolidated-framework-repository.js';

/**
 * @param {Object} params
 * @param {ComplementaryCertificationKeys} params.complementaryCertificationKey
 * @param {Array<string>} params.tubeIds
 * @param {TubeRepository} params.tubeRepository
 * @param {SkillRepository} params.skillRepository
 * @param {ChallengeRepository} params.challengeRepository
 * @param {ConsolidatedFrameworkRepository} params.consolidatedFrameworkRepository
 */
export const createConsolidatedFramework = async ({
  complementaryCertificationKey,
  tubeIds,
  tubeRepository = injectedTubeRepository,
  skillRepository = injectedSkillRepository,
  challengeRepository = injectedChallengeRepository,
  consolidatedFrameworkRepository = injectedConsolidatedFrameworkRepository,
} = {}) => {
  const tubes = await tubeRepository.findActiveByRecordIds(tubeIds, FRENCH_SPOKEN);

  const skillIds = tubes.flatMap((tube) => tube.skillIds);
  const skills = await skillRepository.findActiveByRecordIds(skillIds);

  const challenges = await challengeRepository.findOperativeBySkills(skills, FRENCH_SPOKEN);

  return consolidatedFrameworkRepository.create({
    complementaryCertificationKey,
    challenges,
    version: getVersionNumber(),
  });
};

function getVersionNumber() {
  const date = new Date();

  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getSeconds())
  );
}
