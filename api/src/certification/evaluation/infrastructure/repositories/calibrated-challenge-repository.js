/**
 * @typedef {import('../../../shared/domain/models/Version.js').Version} Version
 */

import * as challengesApi from '../../../../learning-content/application/api/challenges-api.js';
import * as skillsApi from '../../../../learning-content/application/api/skills-api.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CalibratedChallenge } from '../../domain/models/CalibratedChallenge.js';
import { CalibratedChallengeSkill } from '../../domain/models/CalibratedChallengeSkill.js';

const VALIDATED_STATUS = 'validé';

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {Version} params.version
 * @returns {Promise<CalibratedChallenge[]>} challenges with validated LCMS status
 */
export async function findActiveFlashCompatible({ locale, version }) {
  const knexConn = DomainTransaction.getConnection();
  _assertLocaleIsDefined(locale);

  const certificationChallenges = await knexConn
    .select('difficulty', 'discriminant', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty');

  const certificationChallengeIds = certificationChallenges.map(({ challengeId }) => challengeId);
  const baseChallenges = await challengesApi.findInIds({
    ids: certificationChallengeIds,
    status: VALIDATED_STATUS,
    locale,
  });

  const calibratedSkillsMap = await loadCalibratedSkillsMap(baseChallenges);

  return toDomainMap({ baseChallenges, certificationChallenges, calibratedSkillsMap });
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

  let baseChallenges;
  try {
    baseChallenges = await challengesApi.findInIds({
      ids,
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new NotFoundError('Some challenges do not exist in LCMS');
    }
  }
  baseChallenges.sort(_byId);

  const calibratedSkillsMap = await loadCalibratedSkillsMap(baseChallenges);

  return toDomainMap({ baseChallenges, certificationChallenges: calibrations, calibratedSkillsMap });
}

/**
 * @param {object} params
 * @param {Version} params.version
 * @returns {Promise<CalibratedChallenge[]>}
 */
export const getAllCalibratedChallenges = async ({ version }) => {
  const knexConn = DomainTransaction.getConnection();

  const calibrationForThisVersion = await knexConn
    .select('discriminant', 'difficulty', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty')
    .orderBy('challengeId');

  const challengesIds = calibrationForThisVersion.map(({ challengeId }) => challengeId);

  let baseChallenges;
  try {
    baseChallenges = await challengesApi.findInIds({
      ids: challengesIds,
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new NotFoundError('Some challenges do not exist in LCMS');
    }
  }
  baseChallenges.sort(_byId);

  const calibratedSkillsMap = await loadCalibratedSkillsMap(baseChallenges);

  return toDomainMap({ baseChallenges, certificationChallenges: calibrationForThisVersion, calibratedSkillsMap });
};

const _byId = (baseChallenge1, baseChallenge2) => {
  return baseChallenge1.id < baseChallenge2.id ? -1 : 1;
};

function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

async function loadCalibratedSkillsMap(baseChallenges) {
  const uniqueSkillIds = [...new Set(baseChallenges.map((bc) => bc.skillId).filter(Boolean))];
  const baseSkills = await skillsApi.findInIds({
    ids: uniqueSkillIds,
  });
  return new Map(
    baseSkills.map((bs) => [
      bs.id,
      new CalibratedChallengeSkill({
        id: bs.id,
        name: bs.name,
        competenceId: bs.competenceId,
        tubeId: bs.tubeId,
      }),
    ]),
  );
}

function toDomainMap({ baseChallenges, certificationChallenges, calibratedSkillsMap }) {
  return baseChallenges.map((baseChallenge) => {
    const { discriminant, difficulty } = certificationChallenges.find(
      ({ challengeId }) => challengeId === baseChallenge.id,
    );
    const calibratedSkill = baseChallenge.skillId ? calibratedSkillsMap.get(baseChallenge.skillId) : null;
    return new CalibratedChallenge({
      id: baseChallenge.id,
      discriminant,
      difficulty,
      blindnessCompatibility: baseChallenge.accessibility1,
      colorBlindnessCompatibility: baseChallenge.accessibility2,
      skill: calibratedSkill,
    });
  });
}
