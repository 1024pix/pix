import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { getInstance } from '../../../../shared/infrastructure/repositories/challenge-repository.js';
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
  const cacheKey = `findActiveFlashCompatible({ versionId: ${version?.id}, locale: ${locale} })`;

  const calibrations = await knexConn
    .select('difficulty', 'discriminant', 'challengeId')
    .from('certification-frameworks-challenges')
    .where({ versionId: version.id })
    .whereNotNull('discriminant')
    .whereNotNull('difficulty');

  const certificationChallengeIds = calibrations.map(({ challengeId }) => challengeId);

  const lcmsChallengeDtos = await getInstance().find(cacheKey, findCallback(certificationChallengeIds, locale));

  const calibratedSkillsMap = await loadCalibratedSkillsMap(lcmsChallengeDtos);
  return toDomainMap({ lcmsChallengeDtos, calibrations, calibratedSkillsMap });
}

function findCallback(certificationChallengeIds, locale) {
  return (lcmsKnex) => {
    return lcmsKnex
      .select('id', 'skillId', 'accessibility1', 'accessibility2')
      .whereIn('id', certificationChallengeIds)
      .where('status', VALIDATED_STATUS)
      .whereRaw('?=ANY(??)', [locale, 'locales'])
      .orderBy('id');
  };
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

  const lcmsChallengeDtos = await getInstance().loadMany(ids);
  lcmsChallengeDtos.forEach((challengeDto, index) => {
    if (challengeDto) return;
    logger.error({ challengeId: ids[index] }, 'Some challenges do not exist in LCMS');
    throw new NotFoundError('Some challenges do not exist in LCMS');
  });

  lcmsChallengeDtos.sort(_byId);
  const calibratedSkillsMap = await loadCalibratedSkillsMap(lcmsChallengeDtos);
  return toDomainMap({ lcmsChallengeDtos, calibrations, calibratedSkillsMap });
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

  const lcmsChallengeDtos = await getInstance().loadMany(challengesIds);
  lcmsChallengeDtos.forEach((challengeDto, index) => {
    if (challengeDto) return;
    logger.error({ challengeId: challengesIds[index] }, 'Some challenges do not exist in LCMS');
    throw new NotFoundError('Some challenges do not exist in LCMS');
  });

  lcmsChallengeDtos.sort(_byId);
  const calibratedSkillsMap = await loadCalibratedSkillsMap(lcmsChallengeDtos);
  return toDomainMap({ lcmsChallengeDtos, calibrations, calibratedSkillsMap });
}

function _byId(challenge1, challenge2) {
  return challenge1.id < challenge2.id ? -1 : 1;
}

function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

async function loadCalibratedSkillsMap(lcmsChallengeDtos) {
  const uniqueSkillIds = [...new Set(lcmsChallengeDtos.map((lcmsChallengeDto) => lcmsChallengeDto.skillId))];
  const baseSkills = await skillRepository.findByRecordIds(uniqueSkillIds);
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

function toDomainMap({ lcmsChallengeDtos, calibrations, calibratedSkillsMap }) {
  return lcmsChallengeDtos.map((lcmsChallengeDto) => {
    const { discriminant, difficulty } = calibrations.find(({ challengeId }) => challengeId === lcmsChallengeDto.id);
    const calibratedSkill = lcmsChallengeDto.skillId ? calibratedSkillsMap.get(lcmsChallengeDto.skillId) : null;
    return new CalibratedChallenge({
      id: lcmsChallengeDto.id,
      discriminant,
      difficulty,
      blindnessCompatibility: lcmsChallengeDto.accessibility1,
      colorBlindnessCompatibility: lcmsChallengeDto.accessibility2,
      skill: calibratedSkill,
    });
  });
}
