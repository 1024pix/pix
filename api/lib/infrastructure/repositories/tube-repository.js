import { knex } from '../../../db/knex-database-connection.js';
import { config } from '../../../src/shared/config.js';
import { Tube } from '../../../src/shared/domain/models/Tube.js';
import { getTranslatedKey } from '../../../src/shared/domain/services/get-translated-text.js';
import { LearningContentResourceNotFound } from '../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { LearningContentRepository } from '../../../src/shared/infrastructure/repositories/learning-content-repository.js';
import * as oldTubeRepository from './tube-repository_old.js';

const TABLE_NAME = 'learningcontent.tubes';
const ACTIVE_STATUS = 'actif';

export async function get(id) {
  const tubeDto = await getInstance().load(id);
  if (!tubeDto) {
    throw new LearningContentResourceNotFound();
  }
  return toDomain(tubeDto);
}

export async function list() {
  if (!config.featureToggles.useNewLearningContent) return oldTubeRepository.list();
  const cacheKey = `list()`;
  const listCallback = (knex) => knex;
  const tubeDtos = await getInstance().find(cacheKey, listCallback);
  return toDomainList(tubeDtos);
}

export async function findByNames({ tubeNames, locale }) {
  if (!config.featureToggles.useNewLearningContent) return oldTubeRepository.findByNames({ tubeNames, locale });
  const ids = await knex.pluck('id').from(TABLE_NAME).whereIn('name', tubeNames).orderBy('name');
  const tubeDtos = await getInstance().loadMany(ids);
  return toDomainList(tubeDtos, locale);
}

export async function findByRecordIds(ids, locale) {
  if (!config.featureToggles.useNewLearningContent) return oldTubeRepository.findByRecordIds(ids, locale);
  const tubeDtos = await getInstance().loadMany(ids);
  return toDomainList(
    tubeDtos.filter((tubeDto) => tubeDto),
    locale,
  );
}

export async function findActiveByRecordIds(ids, locale) {
  if (!config.featureToggles.useNewLearningContent) return oldTubeRepository.findActiveByRecordIds(ids, locale);
  const activeTubeIds = await knex
    .pluck('tubeId')
    .distinct()
    .from('learningcontent.skills')
    .whereIn('tubeId', ids)
    .where('status', ACTIVE_STATUS)
    .orderBy('tubeId');
  const tubeDtos = await getInstance().loadMany(activeTubeIds);
  return toDomainList(tubeDtos, locale);
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function toDomainList(tubeDtos, locale) {
  return tubeDtos.sort(byName).map((tubeDto) => toDomain(tubeDto, locale));
}

function byName(tube1, tube2) {
  return tube1.name < tube2.name ? -1 : 1;
}

function toDomain(tubeDto, locale) {
  const translatedPracticalTitle = getTranslatedKey(tubeDto.practicalTitle_i18n, locale);
  const translatedPracticalDescription = getTranslatedKey(tubeDto.practicalDescription_i18n, locale);

  return new Tube({
    id: tubeDto.id,
    name: tubeDto.name,
    practicalTitle: translatedPracticalTitle,
    practicalDescription: translatedPracticalDescription,
    isMobileCompliant: tubeDto.isMobileCompliant,
    isTabletCompliant: tubeDto.isTabletCompliant,
    competenceId: tubeDto.competenceId,
    thematicId: tubeDto.thematicId,
    skillIds: tubeDto.skillIds ? [...tubeDto.skillIds] : null,
    skills: [],
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
