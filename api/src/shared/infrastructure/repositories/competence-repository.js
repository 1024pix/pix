import { config } from '../../config.js';
import { LOCALE, PIX_ORIGIN } from '../../domain/constants.js';
import { NotFoundError } from '../../domain/errors.js';
import { Competence } from '../../domain/models/index.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import * as oldCompetenceRepository from './competence-repository_old.js';
import { LearningContentRepository } from './learning-content-repository.js';

const { FRENCH_FRANCE } = LOCALE;
const TABLE_NAME = 'learningcontent.competences';

export async function list({ locale = FRENCH_FRANCE } = {}) {
  if (!config.featureToggles.useNewLearningContent) return oldCompetenceRepository.list({ locale });
  const cacheKey = 'list()';
  const listOrderByIndexCallback = (knex) => knex.orderBy('index');
  const competenceDtos = await getInstance().find(cacheKey, listOrderByIndexCallback);
  return competenceDtos.map((competenceDto) => toDomain({ competenceDto, locale }));
}

export async function listPixCompetencesOnly({ locale = FRENCH_FRANCE } = {}) {
  if (!config.featureToggles.useNewLearningContent) return oldCompetenceRepository.listPixCompetencesOnly({ locale });
  const cacheKey = 'listPixCompetencesOnly()';
  const listPixOrderByIndexCallback = (knex) => knex.where('origin', PIX_ORIGIN).orderBy('index');
  const competenceDtos = await getInstance().find(cacheKey, listPixOrderByIndexCallback);
  return competenceDtos.map((competenceDto) => toDomain({ competenceDto, locale }));
}

export async function get({ id, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldCompetenceRepository.get({ id, locale });
  const competenceDto = await getInstance().load(id);
  if (!competenceDto) {
    throw new NotFoundError('La compétence demandée n’existe pas');
  }
  return toDomain({ competenceDto, locale });
}

export async function getCompetenceName({ id, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldCompetenceRepository.getCompetenceName({ id, locale });
  const competence = await get({ id, locale });
  return competence.name;
}

export async function findByRecordIds({ competenceIds, locale }) {
  if (!config.featureToggles.useNewLearningContent)
    return oldCompetenceRepository.findByRecordIds({ competenceIds, locale });
  const competenceDtos = await getInstance().loadMany(competenceIds);
  return competenceDtos
    .filter((competenceDto) => competenceDto)
    .sort(byId)
    .map((competenceDto) => toDomain({ competenceDto, locale }));
}

export async function findByAreaId({ areaId, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldCompetenceRepository.findByAreaId({ areaId, locale });
  const cacheKey = `findByAreaId({ areaId: ${areaId}, locale: ${locale} })`;
  const findByAreaIdCallback = (knex) => knex.where('areaId', areaId).orderBy('id');
  const competenceDtos = await getInstance().find(cacheKey, findByAreaIdCallback);
  return competenceDtos.map((competenceDto) => toDomain({ competenceDto, locale }));
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function byId(entityA, entityB) {
  return entityA.id < entityB.id ? -1 : 1;
}

function toDomain({ competenceDto, locale }) {
  const translatedCompetenceName = getTranslatedKey(competenceDto.name_i18n, locale);
  const translatedCompetenceDescription = getTranslatedKey(competenceDto.description_i18n, locale);

  return new Competence({
    id: competenceDto.id,
    name: translatedCompetenceName,
    index: competenceDto.index,
    description: translatedCompetenceDescription,
    origin: competenceDto.origin,
    skillIds: competenceDto.skillIds ? [...competenceDto.skillIds] : null,
    thematicIds: competenceDto.thematicIds ? [...competenceDto.thematicIds] : null,
    areaId: competenceDto.areaId,
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
