import { getTranslatedKey } from '../../../shared/domain/services/get-translated-text.js';
import { FRENCH_SPOKEN } from '../../../shared/domain/services/locale-service.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { LearningContentRepository } from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import { Mission, MissionContent, MissionStep } from '../../domain/models/Mission.js';
import { MissionNotFoundError } from '../../domain/school-errors.js';

const TABLE_NAME = 'learningcontent.missions';

export async function get(id, locale = FRENCH_SPOKEN) {
  const parsedIntId = parseInt(id, 10);
  if (isNaN(parsedIntId)) {
    throw new MissionNotFoundError(id);
  }
  const missionDto = await getInstance().load(parsedIntId);
  if (!missionDto) {
    throw new MissionNotFoundError(id);
  }
  return toDomain(missionDto, locale);
}

export async function findAllActiveMissions(locale = FRENCH_SPOKEN) {
  const cacheKey = 'findAllActiveMissions()';
  const acceptedStatuses = (await featureToggles.get('showExperimentalMissions'))
    ? ['VALIDATED', 'EXPERIMENTAL']
    : ['VALIDATED'];
  const findActiveCallback = (knex) => knex.whereIn('status', acceptedStatuses).orderBy('id');
  const missionDtos = await getInstance().find(cacheKey, findActiveCallback);
  return missionDtos.map((missionDto) => toDomain(missionDto, locale));
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function getTranslatedContent(content, locale) {
  const contentWithTranslatedSteps =
    content?.steps?.map((step) => new MissionStep({ ...step, name: getTranslatedKey(step.name_i18n, locale) })) || [];
  return new MissionContent({ ...content, steps: contentWithTranslatedSteps });
}

function toDomain(missionDto, locale) {
  const translatedName = getTranslatedKey(missionDto.name_i18n, locale);
  const translatedLearningObjectives = getTranslatedKey(missionDto.learningObjectives_i18n, locale);
  const translatedValidatedObjectives = getTranslatedKey(missionDto.validatedObjectives_i18n, locale);
  const translatedIntroductionMediaAlt = getTranslatedKey(missionDto.introductionMediaAlt_i18n, locale);
  const translatedContent = getTranslatedContent(missionDto.content, locale);
  return new Mission({
    id: missionDto.id,
    name: translatedName,
    cardImageUrl: missionDto.cardImageUrl,
    competenceId: missionDto.competenceId,
    learningObjectives: translatedLearningObjectives,
    validatedObjectives: translatedValidatedObjectives,
    introductionMediaUrl: missionDto.introductionMediaUrl,
    introductionMediaType: missionDto.introductionMediaType,
    introductionMediaAlt: translatedIntroductionMediaAlt,
    documentationUrl: missionDto.documentationUrl,
    content: translatedContent,
  });
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME, idType: 'integer' });
  }
  return instance;
}
