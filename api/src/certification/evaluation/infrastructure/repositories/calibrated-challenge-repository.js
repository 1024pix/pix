/**
 * @typedef {import('../../../shared/domain/models/Version.js').Version} Version
 * @typedef {import('../../../../shared/domain/models/Skill.js').Skill} Skill
 * @typedef {import('../../domain/models/CalibratedChallenge.js').Accessibility} Accessibility
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { LearningContentRepository } from '../../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CalibratedChallenge } from '../../domain/models/CalibratedChallenge.js';
import { CalibratedChallengeSkill } from '../../domain/models/CalibratedChallengeSkill.js';

const TABLE_NAME = 'learningcontent.challenges';
const VALIDATED_STATUS = 'validé';

/**
 * @typedef {Object} LcmsChallengeRawDTO
 * @property {string} id
 * @property {string} skillId
 * @property {Accessibility} accessibility1
 * @property {Accessibility} accessibility2
 */

/**
 * @typedef {Object} LcmsChallengeDTO
 * @property {string} id
 * @property {string} skillId
 * @property {number} discriminant
 * @property {number} difficulty
 * @property {Accessibility} accessibility1
 * @property {Accessibility} accessibility2
 */

/**
 * @typedef {Object} Dependencies
 * @property {function(): LearningContentRepository} getInstance
 */

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {Version} params.version
 * @param {Dependencies} params.dependencies
 * @returns {Promise<Array<CalibratedChallenge>>} challenges with validated LCMS status
 */
export async function findActiveFlashCompatible({
  locale,
  version,
  dependencies = {
    getInstance,
  },
}) {
  const knexConn = DomainTransaction.getConnection();
  _assertLocaleIsDefined(locale);
  const cacheKey = `findActiveFlashCompatible({ versionId: ${version?.id}, locale: ${locale} })`;

  const certificationChallenges = await knexConn
    .select('difficulty', 'discriminant', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty');

  const certificationChallengeIds = certificationChallenges.map(({ challengeId }) => challengeId);

  const findCallback = async (lcmsKnex) => {
    return lcmsKnex
      .select('id', 'skillId', 'accessibility1', 'accessibility2')
      .whereIn('id', certificationChallengeIds)
      .where('status', VALIDATED_STATUS)
      .whereRaw('?=ANY(??)', [locale, 'locales'])
      .orderBy('id');
  };

  /** @type {Array<LcmsChallengeRawDTO>} */
  const validChallengeDtosResult =
    /**@type {Array<LcmsChallengeRawDTO>} */
    (await dependencies.getInstance().find(cacheKey, findCallback));

  const challengeDtos = decorateWithCertificationCalibration({
    validChallengeDtos: validChallengeDtosResult,
    certificationChallenges,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
}

/**
 * @param {object} params
 * @param {Array<string>} params.ids
 * @param {Version} params.version
 * @param {Dependencies} params.dependencies
 * @returns {Promise<Array<CalibratedChallenge>>} challenges with validated LCMS status
 */
export async function getMany({
  ids,
  version,
  dependencies = {
    getInstance,
  },
}) {
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

  /** @type {Array<LcmsChallengeDTO | null>} */
  const lcmsChallengesResult =
    /**@type {Array<LcmsChallengeDTO | null>} */
    (await dependencies.getInstance().loadMany(ids));

  const lcmsChallenges = lcmsChallengesResult.map((challengeDto, index) => {
    if (!challengeDto) {
      logger.error({ challengeId: ids[index] }, 'Some challenges do not exist in LCMS');
      throw new NotFoundError('Some challenges do not exist in LCMS');
    }
    return challengeDto;
  });

  lcmsChallenges.sort(_byId);

  const challengesWithCalibration = decorateWithCertificationCalibration({
    validChallengeDtos: lcmsChallenges,
    certificationChallenges: calibrations,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengesWithCalibration);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
}

/**
 * @param {object} params
 * @param {Version} params.version
 * @param {Dependencies} params.dependencies
 * @returns {Promise<Array<CalibratedChallenge>>}
 */
export const getAllCalibratedChallenges = async ({
  version,
  dependencies = {
    getInstance,
  },
}) => {
  const knexConn = DomainTransaction.getConnection();

  const calibrationForThisVersion = await knexConn
    .select('discriminant', 'difficulty', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty')
    .orderBy('challengeId');

  const challengesIds = calibrationForThisVersion.map(({ challengeId }) => challengeId);

  /** @type {Array<LcmsChallengeDTO | null>} */
  const lcmsChallenges =
    /**@type {Array<LcmsChallengeDTO | null>} */
    (await dependencies.getInstance().loadMany(challengesIds));

  const validChallengeDtos = lcmsChallenges.map((challengeDto, index) => {
    if (!challengeDto) {
      logger.error({ challengeId: challengesIds[index] }, 'Some challenges do not exist in LCMS');
      throw new NotFoundError('Some challenges do not exist in LCMS');
    }
    return challengeDto;
  });

  validChallengeDtos.sort(_byId);

  const challengesWithCalibration = decorateWithCertificationCalibration({
    validChallengeDtos,
    certificationChallenges: calibrationForThisVersion,
  });

  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengesWithCalibration);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => _toDomain({ challengeDto, skill }));
};

/**
 * @typedef {Object} CertificationChallengeDTO
 * @property {string} challengeId
 * @property {number} discriminant
 * @property {number} difficulty
 */

/**
 * @function
 * @param {LcmsChallengeDTO} challenge1
 * @param {LcmsChallengeDTO} challenge2
 * @returns {number}
 */
const _byId = (challenge1, challenge2) => {
  return challenge1.id < challenge2.id ? -1 : 1;
};

/**
 * @function
 * @param {Array<LcmsChallengeDTO>} challengeDtos
 * @returns {Promise<Array<[LcmsChallengeDTO, Skill|null]>>}
 */
async function loadChallengeDtosSkills(challengeDtos) {
  return Promise.all(
    challengeDtos.map(async (challengeDto) => [
      challengeDto,
      challengeDto.skillId ? await skillRepository.get(challengeDto.skillId) : null,
    ]),
  );
}

/**
 * @function
 * @param {Object} params
 * @param {Array<LcmsChallengeRawDTO>} params.validChallengeDtos
 * @param {Array<CertificationChallengeDTO>} params.certificationChallenges
 * @returns {Array<LcmsChallengeDTO>}
 */
function decorateWithCertificationCalibration({ validChallengeDtos, certificationChallenges }) {
  return validChallengeDtos.map((challenge) => {
    const calibration = certificationChallenges.find(({ challengeId }) => challengeId === challenge.id);

    if (!calibration) {
      logger.error(
        { challengeId: challenge.id },
        'decorateWithCertificationCalibration: calibration not found for challenge',
      );
      throw new NotFoundError('Calibration not found for challenge');
    }

    const { discriminant, difficulty } = calibration;

    return {
      ...challenge,
      discriminant,
      difficulty,
    };
  });
}

/**
 * @function
 * @param {string} locale
 * @throws {Error}
 */
function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

/**
 * @function
 * @param {Object} params
 * @param {LcmsChallengeDTO} params.challengeDto
 * @param {Skill | null} params.skill
 * @returns {CalibratedChallenge}
 */
function _toDomain({ challengeDto, skill }) {
  return new CalibratedChallenge({
    id: challengeDto.id,
    discriminant: challengeDto.discriminant,
    difficulty: challengeDto.difficulty,
    blindnessCompatibility: challengeDto.accessibility1,
    colorBlindnessCompatibility: challengeDto.accessibility2,
    skill: skill
      ? new CalibratedChallengeSkill({
          id: skill.id,
          name: skill.name,
          competenceId: skill.competenceId,
          tubeId: skill.tubeId,
        })
      : null,
  });
}

/** @type {LearningContentRepository | undefined} */
let instance;

/**
 * @returns {LearningContentRepository}
 */
function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
