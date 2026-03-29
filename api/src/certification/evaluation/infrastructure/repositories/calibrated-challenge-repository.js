/**
 * @typedef {import('../../../shared/domain/models/Version.js').Version} Version
 */

import * as challengesApi from '../../../../learning-content/application/api/challenges-api.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
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

  const challengeDtos = decorateWithCertificationCalibration({
    baseChallenges,
    certificationChallenges,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
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

  const challengesWithCalibration = decorateWithCertificationCalibration({
    baseChallenges,
    certificationChallenges: calibrations,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengesWithCalibration);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
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

  const challengesWithCalibration = decorateWithCertificationCalibration({
    baseChallenges,
    certificationChallenges: calibrationForThisVersion,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengesWithCalibration);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
};

const _byId = (baseChallenge1, baseChallenge2) => {
  return baseChallenge1.id < baseChallenge2.id ? -1 : 1;
};

async function loadChallengeDtosSkills(challengeDtos) {
  return Promise.all(
    challengeDtos.map(async (challengeDto) => [
      challengeDto,
      challengeDto.skillId ? await skillRepository.get(challengeDto.skillId) : null,
    ]),
  );
}

function decorateWithCertificationCalibration({ baseChallenges, certificationChallenges }) {
  return baseChallenges.map((baseChallenge) => {
    const { discriminant, difficulty } = certificationChallenges.find(
      ({ challengeId }) => challengeId === baseChallenge.id,
    );

    return {
      id: baseChallenge.id,
      skillId: baseChallenge.skillId,
      accessibility1: baseChallenge.accessibility1,
      accessibility2: baseChallenge.accessibility2,
      discriminant,
      difficulty,
    };
  });
}

function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

function _toDomain({ challengeDto, skill }) {
  return new CalibratedChallenge({
    id: challengeDto.id,
    discriminant: challengeDto.discriminant,
    difficulty: challengeDto.difficulty,
    blindnessCompatibility: challengeDto.accessibility1,
    colorBlindnessCompatibility: challengeDto.accessibility2,
    skill: new CalibratedChallengeSkill({
      id: skill.id,
      name: skill.name,
      competenceId: skill.competenceId,
      tubeId: skill.tubeId,
    }),
  });
}
