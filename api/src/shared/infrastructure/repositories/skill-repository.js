import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';
import { Skill } from '../../domain/models/Skill.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import { child, SCOPES } from '../utils/logger.js';
import { LearningContentRepository } from './learning-content-repository.js';

const TABLE_NAME = 'learningcontent.skills';
const ACTIVE_STATUS = 'actif';
const ARCHIVED_STATUS = 'archivé';
const OPERATIVE_STATUSES = [ACTIVE_STATUS, ARCHIVED_STATUS];

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export async function get(id, { locale, useFallback } = { locale: null, useFallback: true }) {
  const skillDto = await getInstance().load(id);
  if (!skillDto) {
    logger.warn({ skillId: id }, 'Acquis introuvable');
    throw new NotFoundError('Erreur, acquis introuvable');
  }
  return toDomain(skillDto, locale, useFallback);
}

export async function list() {
  const cacheKey = 'list()';
  const listCallback = (knex) => knex.orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, listCallback);
  return skillDtos.map(toDomain);
}

export async function findActiveByTubeId(tubeId) {
  const cacheKey = `findActiveByTubeId(${tubeId})`;
  const findActiveByTubeIdCallback = (knex) => knex.where({ tubeId, status: ACTIVE_STATUS }).orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, findActiveByTubeIdCallback);
  return skillDtos.map(toDomain);
}

export async function findActiveByCompetenceId(competenceId) {
  const cacheKey = `findActiveByCompetenceId(${competenceId})`;
  const findActiveByCompetenceIdCallback = (knex) => knex.where({ competenceId, status: ACTIVE_STATUS }).orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, findActiveByCompetenceIdCallback);
  return skillDtos.map(toDomain);
}

export async function findOperativeByCompetenceIds(competenceIds) {
  const knexConn = DomainTransaction.getConnection();
  const ids = await knexConn
    .pluck('id')
    .from(TABLE_NAME)
    .whereIn('competenceId', competenceIds)
    .whereIn('status', OPERATIVE_STATUSES)
    .orderBy('id');
  const skillDtos = await getInstance().loadMany(ids);
  return skillDtos.map(toDomain);
}

export async function findOperativeByIds(ids) {
  const skillDtos = await getInstance().getMany(ids);
  return skillDtos
    .filter((skillDto) => skillDto && OPERATIVE_STATUSES.includes(skillDto.status))
    .sort(byId)
    .map(toDomain);
}

export async function findByRecordIds(ids) {
  const skillDtos = await getInstance().getMany(ids);
  return skillDtos
    .filter((skillDto) => skillDto)
    .sort(byId)
    .map(toDomain);
}

export async function findActiveByRecordIds(ids) {
  const skillDtos = await getInstance().getMany(ids);
  return skillDtos
    .filter((skillDto) => skillDto && skillDto.status === ACTIVE_STATUS)
    .sort(byId)
    .map(toDomain);
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function byId(entityA, entityB) {
  return entityA.id < entityB.id ? -1 : 1;
}

function toDomain(skillDto, locale, useFallback) {
  const translatedHint = getTranslatedKey(skillDto.hint_i18n, locale, useFallback);
  return new Skill({
    id: skillDto.id,
    name: skillDto.name,
    pixValue: skillDto.pixValue,
    competenceId: skillDto.competenceId,
    tutorialIds: skillDto.tutorialIds ? [...skillDto.tutorialIds] : null,
    tubeId: skillDto.tubeId,
    version: skillDto.version,
    difficulty: skillDto.level,
    learningMoreTutorialIds: skillDto.learningMoreTutorialIds ? [...skillDto.learningMoreTutorialIds] : null,
    status: skillDto.status,
    hintStatus: skillDto.hintStatus,
    hint: translatedHint,
  });
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
