/**
 * @typedef {import('../../../shared/domain/models/Version.js').Version} Version
 */

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
export async function findActiveFlashCompatible({ locale, version } = {}) {
  const knexConn = DomainTransaction.getConnection();

  const certificationChallenges = await knexConn
    .select('difficulty', 'discriminant', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty');

  const certificationChallengeIds = certificationChallenges.map(({ challengeId }) => challengeId);

  const lcmsChallenges = await challengeRepository.findValidatedByIds_proxy({
    version: version.id,
    locale,
    ids: certificationChallengeIds,
  });

  const challengeDtos = decorateWithCertificationCalibration({
    lcmsChallenges,
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

  const lcmsChallenges = await challengeRepository.getMany_proxy(ids);
  lcmsChallenges.sort(_byId);

  const challengesWithCalibration = decorateWithCertificationCalibration({
    lcmsChallenges,
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
export async function getAllCalibratedChallenges({ version }) {
  const knexConn = DomainTransaction.getConnection();

  const calibrationForThisVersion = await knexConn
    .select('discriminant', 'difficulty', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty')
    .orderBy('challengeId');

  const challengesIds = calibrationForThisVersion.map(({ challengeId }) => challengeId);

  const lcmsChallenges = await challengeRepository.getMany_proxy(challengesIds);
  lcmsChallenges.sort(_byId);

  const challengesWithCalibration = decorateWithCertificationCalibration({
    lcmsChallenges,
    certificationChallenges: calibrationForThisVersion,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengesWithCalibration);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
}

const _byId = (challenge1, challenge2) => {
  return challenge1.id < challenge2.id ? -1 : 1;
};

async function loadChallengeDtosSkills(challengeDtos) {
  return Promise.all(
    challengeDtos.map(async (challengeDto) => [
      challengeDto,
      challengeDto.skillId ? await skillRepository.get(challengeDto.skillId) : null,
    ]),
  );
}

function decorateWithCertificationCalibration({ lcmsChallenges, certificationChallenges }) {
  return lcmsChallenges.map((lcmsChallenge) => {
    const { discriminant, difficulty } = certificationChallenges.find(
      ({ challengeId }) => challengeId === lcmsChallenge.id,
    );

    return {
      id: lcmsChallenge.id,
      blindnessCompatibility: lcmsChallenge.accessibility1,
      colorBlindnessCompatibility: lcmsChallenge.accessibility2,
      skillId: lcmsChallenge.skillId,
      discriminant,
      difficulty,
    };
  });
}

function _toDomain({ challengeDto, skill }) {
  return new CalibratedChallenge({
    id: challengeDto.id,
    discriminant: challengeDto.discriminant,
    difficulty: challengeDto.difficulty,
    blindnessCompatibility: challengeDto.blindnessCompatibility,
    colorBlindnessCompatibility: challengeDto.colorBlindnessCompatibility,
    skill: new CalibratedChallengeSkill({
      id: skill.id,
      name: skill.name,
      competenceId: skill.competenceId,
      tubeId: skill.tubeId,
    }),
  });
}
