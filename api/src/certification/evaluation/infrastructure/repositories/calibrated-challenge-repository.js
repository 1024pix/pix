import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CalibratedChallenge } from '../../domain/models/CalibratedChallenge.js';
import { CalibratedChallengeSkill } from '../../domain/models/CalibratedChallengeSkill.js';

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {Version} params.version
 * @returns {Promise<CalibratedChallenge[]>} challenges with validated LCMS status
 */
export async function findActiveFlashCompatible({ locale, version }) {
  const knexConn = DomainTransaction.getConnection();
  const customCacheKey = `findValidatedByIdsAndLocale_proxy({ versionId: ${version.id}, locale: ${locale} })`;

  const calibrations = await knexConn
    .select('difficulty', 'discriminant', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty');

  const certificationChallengeIds = calibrations.map(({ challengeId }) => challengeId);

  const challenges = await challengeRepository.findValidatedByIdsAndLocale_proxy({
    ids: certificationChallengeIds,
    locale,
    customCacheKey,
  });
  const calibratedSkillsMap = await loadCalibratedSkillsMap(challenges);
  return toDomainMap({ challenges, calibrations, calibratedSkillsMap });
}

/**
 * @param {object} params
 * @param {Array<string>} params.ids - array of challenge ids
 * @param {Version} params.version
 * @returns {Promise<CalibratedChallenge[]>}
 */
export async function getMany({ ids, version }) {
  const knexConn = DomainTransaction.getConnection();
  const calibrations = await knexConn
    .select('difficulty', 'discriminant', 'challengeId')
    .from('certification-frameworks-challenges')
    .whereIn('challengeId', ids)
    .andWhere({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty');

  if (calibrations.length !== ids.length) {
    logger.error({ challengeIds: ids }, 'Some challenges do not exist in certification version');
    throw new NotFoundError('Some challenges do not exist in certification version');
  }

  const challenges = await challengeRepository.findByIds_proxy(ids);

  challenges.sort(_byId);
  const calibratedSkillsMap = await loadCalibratedSkillsMap(challenges);
  return toDomainMap({ challenges, calibrations, calibratedSkillsMap });
}

/**
 * @param {object} params
 * @param {Version} params.version
 * @returns {Promise<CalibratedChallenge[]>}
 */
export async function getAllCalibratedChallenges({ version }) {
  const knexConn = DomainTransaction.getConnection();

  const calibrations = await knexConn
    .select('discriminant', 'difficulty', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty')
    .orderBy('challengeId');

  const challengesIds = calibrations.map(({ challengeId }) => challengeId);

  const challenges = await challengeRepository.findByIds_proxy(challengesIds);

  challenges.sort(_byId);
  const calibratedSkillsMap = await loadCalibratedSkillsMap(challenges);
  return toDomainMap({ challenges, calibrations, calibratedSkillsMap });
}

function _byId(challenge1, challenge2) {
  return challenge1.id < challenge2.id ? -1 : 1;
}

async function loadCalibratedSkillsMap(challenges) {
  const uniqueSkillIds = [...new Set(challenges.map((challenges) => challenges.skillId))];
  const skills = await skillRepository.findByRecordIds_proxy(uniqueSkillIds);
  return new Map(
    skills.map((skill) => [
      skill.id,
      new CalibratedChallengeSkill({
        id: skill.id,
        name: skill.name,
        competenceId: skill.competenceId,
        tubeId: skill.tubeId,
      }),
    ]),
  );
}

function toDomainMap({ challenges, calibrations, calibratedSkillsMap }) {
  return challenges.map((challenge) => {
    const { discriminant, difficulty } = calibrations.find(({ challengeId }) => challengeId === challenge.id);
    const calibratedSkill = challenge.skillId ? calibratedSkillsMap.get(challenge.skillId) : null;
    return new CalibratedChallenge({
      id: challenge.id,
      discriminant,
      difficulty,
      blindnessCompatibility: challenge.accessibility1,
      colorBlindnessCompatibility: challenge.accessibility2,
      skill: calibratedSkill,
    });
  });
}
