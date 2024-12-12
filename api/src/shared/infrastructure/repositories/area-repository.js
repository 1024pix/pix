import { config } from '../../config.js';
import { PIX_ORIGIN } from '../../domain/constants.js';
import { NotFoundError } from '../../domain/errors.js';
import { Area } from '../../domain/models/Area.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import * as oldAreaRepository from './area-repository_old.js';
import * as competenceRepository from './competence-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

const TABLE_NAME = 'learningcontent.areas';

export async function list({ locale } = {}) {
  if (!config.featureToggles.useNewLearningContent) return oldAreaRepository.list({ locale });
  const cacheKey = 'list()';
  const listCallback = (knex) => knex.orderBy('id');
  const areaDtos = await getInstance().find(cacheKey, listCallback);
  return areaDtos.map((areaDto) => toDomain(areaDto, locale));
}

export async function listWithPixCompetencesOnly({ locale } = {}) {
  if (!config.featureToggles.useNewLearningContent) return oldAreaRepository.listWithPixCompetencesOnly({ locale });
  const cacheKey = 'listWithPixCompetencesOnly()';
  const listPixAreasCallback = (knex) =>
    knex
      .join('learningcontent.frameworks', 'learningcontent.frameworks.id', `${TABLE_NAME}.frameworkId`)
      .where('learningcontent.frameworks.name', PIX_ORIGIN)
      .orderBy(`${TABLE_NAME}.name`);
  const areaDtos = await getInstance().find(cacheKey, listPixAreasCallback);
  return toDomainWithPixCompetences(areaDtos, locale);
}

export async function findByFrameworkIdWithCompetences({ frameworkId, locale }) {
  if (!config.featureToggles.useNewLearningContent)
    return oldAreaRepository.findByFrameworkIdWithCompetences({ frameworkId, locale });
  const cacheKey = `findByFrameworkIdWithCompetences({ frameworkId: ${frameworkId} })`;
  const findAreasByFrameworkIdCallback = (knex) => knex.where('frameworkId', frameworkId).orderBy('id');
  const areaDtos = await getInstance().find(cacheKey, findAreasByFrameworkIdCallback);
  return toDomainWithCompetences(areaDtos, locale);
}

export async function findByFrameworkId({ frameworkId, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldAreaRepository.findByFrameworkId({ frameworkId, locale });
  const cacheKey = `findByFrameworkId({ frameworkId: ${frameworkId} })`;
  const findAreasByFrameworkIdCallback = (knex) => knex.where('frameworkId', frameworkId).orderBy('id');
  const areaDtos = await getInstance().find(cacheKey, findAreasByFrameworkIdCallback);
  return areaDtos.map((areaDto) => toDomain(areaDto, locale));
}

export async function findByRecordIds({ areaIds, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldAreaRepository.findByRecordIds({ areaIds, locale });
  const areaDtos = await getInstance().loadMany(areaIds);
  return areaDtos
    .filter((areaDto) => areaDto)
    .sort(byId)
    .map((areaDto) => toDomain(areaDto, locale));
}

export async function getAreaCodeByCompetenceId(competenceId) {
  if (!config.featureToggles.useNewLearningContent) return oldAreaRepository.getAreaCodeByCompetenceId(competenceId);
  const cacheKey = `getAreaCodeByCompetenceId(${competenceId})`;
  const findByCompetenceIdCallback = (knex) => knex.whereRaw('?=ANY(??)', [competenceId, 'competenceIds']).limit(1);
  const [areaDto] = await getInstance().find(cacheKey, findByCompetenceIdCallback);
  return areaDto?.code;
}

export async function get({ id, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldAreaRepository.get({ id, locale });
  const areaDto = await getInstance().load(id);
  if (!areaDto) {
    throw new NotFoundError(`Area "${id}" not found.`);
  }
  return toDomain(areaDto, locale);
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function byId(entityA, entityB) {
  return entityA.id < entityB.id ? -1 : 1;
}

function toDomain(areaDto, locale) {
  const translatedTitle = getTranslatedKey(areaDto.title_i18n, locale);
  return new Area({
    id: areaDto.id,
    code: areaDto.code,
    name: areaDto.name,
    title: translatedTitle,
    color: areaDto.color,
    frameworkId: areaDto.frameworkId,
  });
}

async function toDomainWithPixCompetences(areaDtos, locale) {
  const areas = [];
  for (const areaDto of areaDtos) {
    const competences = [];
    for (const competenceId of areaDto.competenceIds) {
      const competence = await competenceRepository.get({ id: competenceId, locale });
      if (competence.origin === PIX_ORIGIN) {
        competences.push(competence);
      }
    }
    const area = toDomain(areaDto, locale);
    area.competences = competences;
    areas.push(area);
  }
  return areas;
}

async function toDomainWithCompetences(areaDtos, locale) {
  const areas = [];
  for (const areaDto of areaDtos) {
    const competences = [];
    for (const competenceId of areaDto.competenceIds) {
      const competence = await competenceRepository.get({ id: competenceId, locale });
      competences.push(competence);
    }
    const area = toDomain(areaDto, locale);
    area.competences = competences;
    areas.push(area);
  }
  return areas;
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
