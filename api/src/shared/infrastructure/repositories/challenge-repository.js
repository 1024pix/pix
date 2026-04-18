import { Challenge as ChallengeProxy, STATUSES } from '../../../learning-content/domain/models/Challenge.js';
import { NotFoundError } from '../../domain/errors.js';
import { child, SCOPES } from '../utils/logger.js';
import { LearningContentRepository } from './learning-content-repository.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

const TABLE_NAME = 'learningcontent.challenges';
const OPERATIVE_STATUSES = [STATUSES.VALIDATED, STATUSES.ARCHIVED];

export async function get_proxy(id) {
  const challengeDto = await getInstance().load(id);
  if (!challengeDto) {
    logger.warn({ challengeId: id }, 'Épreuve introuvable');
    throw new NotFoundError('Épreuve introuvable');
  }
  return new ChallengeProxy(challengeDto);
}

export async function getMany_proxy(ids, locale) {
  const challengeDtos = await getInstance().loadMany(ids);
  challengeDtos.forEach((challengeDto, index) => {
    if (challengeDto) return;
    logger.warn({ challengeId: ids[index] }, 'Épreuve introuvable');
    throw new NotFoundError('Épreuve introuvable');
  });
  const localeChallengeDtos = locale
    ? challengeDtos.filter((challengeDto) => challengeDto.locales.includes(locale))
    : challengeDtos;
  localeChallengeDtos.sort(byId);
  return localeChallengeDtos.map((challengeDto) => new ChallengeProxy(challengeDto));
}

export async function list_proxy(locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `list(${locale})`;
  const findByLocaleCallback = (knex) => knex.whereRaw('?=ANY(??)', [locale, 'locales']).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findByLocaleCallback);
  return challengeDtos.map((challengeDto) => new ChallengeProxy(challengeDto));
}

export async function findValidatedByCompetenceId_proxy(competenceId, locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `findValidatedByCompetenceId(${competenceId}, ${locale})`;
  const findValidatedByLocaleByCompetenceIdCallback = (knex) =>
    knex.whereRaw('?=ANY(??)', [locale, 'locales']).where({ competenceId, status: STATUSES.VALIDATED }).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findValidatedByLocaleByCompetenceIdCallback);
  return challengeDtos.map((challengeDto) => new ChallengeProxy(challengeDto));
}

export async function findOperativeBySkillsAndLocales_proxy(skills, locales) {
  const skillIds = skills.map((skill) => skill.id);
  const cacheKey = `findOperativesBySkillsAndLocales([${skillIds.sort()}], ${locales.sort().join(',')})`;

  const findOperativeByLocaleBySkillIdsCallback = (knex) =>
    knex
      .whereRaw('?? && ?', ['locales', locales])
      .whereIn('status', OPERATIVE_STATUSES)
      .whereIn('skillId', skillIds)
      .orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findOperativeByLocaleBySkillIdsCallback);
  return challengeDtos.map((challengeDto) => new ChallengeProxy(challengeDto));
}

export async function findOperativeBySkills_proxy(skills, locale) {
  _assertLocaleIsDefined(locale);
  const skillIds = skills.map((skill) => skill.id);
  const cacheKey = `findOperativeBySkills([${skillIds.sort()}], ${locale})`;
  const findOperativeByLocaleBySkillIdsCallback = (knex) =>
    knex
      .whereRaw('?=ANY(??)', [locale, 'locales'])
      .whereIn('status', OPERATIVE_STATUSES)
      .whereIn('skillId', skillIds)
      .orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findOperativeByLocaleBySkillIdsCallback);
  return challengeDtos.map((challengeDto) => new ChallengeProxy(challengeDto));
}

export async function findValidatedBySkills_proxy(skills, locale) {
  _assertLocaleIsDefined(locale);
  const skillIds = skills.map((skill) => skill.id);
  const cacheKey = `findValidatedBySkills([${skillIds.sort()}], ${locale})`;
  const findOperativeByLocaleBySkillIdsCallback = (knex) =>
    knex
      .whereRaw('?=ANY(??)', [locale, 'locales'])
      .where('status', STATUSES.VALIDATED)
      .whereIn('skillId', skillIds)
      .orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findOperativeByLocaleBySkillIdsCallback);
  return challengeDtos.map((challengeDto) => new ChallengeProxy(challengeDto));
}

export async function getManyTypes(ids) {
  const challengeDtos = await getInstance().loadMany(ids);
  if (challengeDtos.some((challengeDto) => !challengeDto)) {
    throw new NotFoundError();
  }
  return Object.fromEntries(challengeDtos.map(({ id, type }) => [id, type]));
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

function byId(challenge1, challenge2) {
  return challenge1.id < challenge2.id ? -1 : 1;
}

/** @type {LearningContentRepository} */
let instance;

export function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
