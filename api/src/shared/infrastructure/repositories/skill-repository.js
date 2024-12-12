import { config } from '../../config.js';
import { NotFoundError } from '../../domain/errors.js';
import { Skill } from '../../domain/models/Skill.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import { LearningContentRepository } from './learning-content-repository.js';
import * as oldSkillRepository from './skill-repository_old.js';

const TABLE_NAME = 'learningcontent.skills';
const ACTIVE_STATUS = 'actif';
const ARCHIVED_STATUS = 'archivé';
const OPERATIVE_STATUSES = [ACTIVE_STATUS, ARCHIVED_STATUS];

export async function get(id, { locale, useFallback } = { locale: null, useFallback: true }) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.get(id, { locale, useFallback });
  const skillDto = await getInstance().load(id);
  if (!skillDto) {
    throw new NotFoundError('Erreur, acquis introuvable');
  }
  return toDomain(skillDto, locale, useFallback);
}

export async function list() {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.list();
  const cacheKey = 'list()';
  const listCallback = (knex) => knex.orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, listCallback);
  return skillDtos.map(toDomain);
}

export async function findActiveByTubeId(tubeId) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findActiveByTubeId(tubeId);
  const cacheKey = `findActiveByTubeId(${tubeId})`;
  const findActiveByTubeIdCallback = (knex) => knex.where({ tubeId, status: ACTIVE_STATUS }).orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, findActiveByTubeIdCallback);
  return skillDtos.map(toDomain);
}

export async function findOperativeByTubeId(tubeId) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findOperativeByTubeId(tubeId);
  const cacheKey = `findOperativeByTubeId(${tubeId})`;
  const findOperativeByTubeIdCallback = (knex) =>
    knex.where({ tubeId }).whereIn('status', OPERATIVE_STATUSES).orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, findOperativeByTubeIdCallback);
  return skillDtos.map(toDomain);
}

export async function findActiveByCompetenceId(competenceId) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findActiveByCompetenceId(competenceId);
  const cacheKey = `findActiveByCompetenceId(${competenceId})`;
  const findActiveByCompetenceIdCallback = (knex) => knex.where({ competenceId, status: ACTIVE_STATUS }).orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, findActiveByCompetenceIdCallback);
  return skillDtos.map(toDomain);
}

export async function findOperativeByCompetenceId(competenceId) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findOperativeByCompetenceId(competenceId);
  const cacheKey = `findOperativeByCompetenceId(${competenceId})`;
  const findOperativeByCompetenceIdCallback = (knex) =>
    knex.where({ competenceId }).whereIn('status', OPERATIVE_STATUSES).orderBy('id');
  const skillDtos = await getInstance().find(cacheKey, findOperativeByCompetenceIdCallback);
  return skillDtos.map(toDomain);
}

export async function findOperativeByCompetenceIds(competenceIds) {
  if (!config.featureToggles.useNewLearningContent)
    return oldSkillRepository.findOperativeByCompetenceIds(competenceIds);
  const skills = [];
  for (const competenceId of competenceIds) {
    const skillsForCompetence = await findOperativeByCompetenceId(competenceId);
    skills.push(...skillsForCompetence);
  }
  return skills.sort(byId);
}

export async function findOperativeByIds(ids) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findOperativeByIds(ids);
  const skillDtos = await getInstance().loadMany(ids);
  return skillDtos
    .filter((skillDto) => skillDto && OPERATIVE_STATUSES.includes(skillDto.status))
    .sort(byId)
    .map(toDomain);
}

export async function findByRecordIds(ids) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findByRecordIds(ids);
  const skillDtos = await getInstance().loadMany(ids);
  return skillDtos
    .filter((skillDto) => skillDto)
    .sort(byId)
    .map(toDomain);
}

export async function findActiveByRecordIds(ids) {
  if (!config.featureToggles.useNewLearningContent) return oldSkillRepository.findActiveByRecordIds(ids);
  const skillDtos = await getInstance().loadMany(ids);
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
