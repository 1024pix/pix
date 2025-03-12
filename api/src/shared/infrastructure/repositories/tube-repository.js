import { knex } from '../../../../db/knex-database-connection.js';
import { LearningContentResourceNotFound } from '../../domain/errors.js';
import { Tube } from '../../domain/models/Tube.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import { child, SCOPES } from '../utils/logger.js';
import { LearningContentDatasource } from './learning-content-datasource.js';

const TABLE_NAME = 'learningcontent.tubes';
const ACTIVE_STATUS = 'actif';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export async function get(id) {
  const tubeDto = await getInstance().load(id);
  if (!tubeDto) {
    logger.warn({ tubeId: id }, 'Tube introuvable');
    throw new LearningContentResourceNotFound();
  }
  return toDomain(tubeDto);
}

export async function list() {
  const cacheKey = `list()`;
  const listCallback = (knex) => knex;
  const tubeDtos = await getInstance().find(cacheKey, listCallback);
  return toDomainList(tubeDtos);
}

export async function findByNames({ tubeNames, locale }) {
  if (!tubeNames) {
    return [];
  }
  const ids = await knex.pluck('id').from(TABLE_NAME).whereIn('name', tubeNames).orderBy('name');
  const tubeDtos = await getInstance().loadMany(ids);
  return toDomainList(tubeDtos, locale);
}

export async function findByRecordIds(ids, locale) {
  const tubeDtos = await getInstance().getMany(ids);
  return toDomainList(
    tubeDtos.filter((tubeDto) => tubeDto),
    locale,
  );
}

export async function findActiveByRecordIds(ids, locale) {
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

/** @type {LearningContentDatasource} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentDatasource({ tableName: TABLE_NAME });
  }
  return instance;
}
