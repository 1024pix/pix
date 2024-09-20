import { config } from '../../../shared/config.js';
import { LOCALE } from '../../../shared/domain/constants.js';
import { getTranslatedKey } from '../../../shared/domain/services/get-translated-text.js';
import { Mission, MissionContent, MissionStep } from '../../domain/models/Mission.js';
import { MissionNotFoundError } from '../../domain/school-errors.js';
import { missionDatasource } from '../datasources/learning-content/mission-datasource.js';

const { FRENCH_FRANCE } = LOCALE;

function _toDomain(data, locale) {
  const translatedName = getTranslatedKey(data.name_i18n, locale);
  const translatedLearningObjectives = getTranslatedKey(data.learningObjectives_i18n, locale);
  const translatedValidatedObjectives = getTranslatedKey(data.validatedObjectives_i18n, locale);
  const translatedContent = getTranslatedContent(data.content, locale);
  return new Mission({
    id: data.id,
    name: translatedName,
    competenceId: data.competenceId,
    thematicId: data.thematicId,
    learningObjectives: translatedLearningObjectives,
    validatedObjectives: translatedValidatedObjectives,
    introductionMediaUrl: data.introductionMediaUrl,
    introductionMediaType: data.introductionMediaType,
    introductionMediaAlt: data.introductionMediaAlt,
    documentationUrl: data.documentationUrl,
    content: translatedContent,
  });
}

async function get(id, locale = { locale: FRENCH_FRANCE }) {
  try {
    const missionData = await missionDatasource.get(parseInt(id, 10));
    return _toDomain(missionData, locale);
  } catch (error) {
    throw new MissionNotFoundError(id);
  }
}

async function findAllActiveMissions(locale = { locale: FRENCH_FRANCE }) {
  const allMissions = await missionDatasource.list();
  const allActiveMissions = allMissions.filter((mission) => {
    return (
      mission.status === 'VALIDATED' ||
      (config.featureToggles.showExperimentalMissions && mission.status === 'EXPERIMENTAL')
    );
  });
  return allActiveMissions.map((missionData) => _toDomain(missionData, locale));
}

export { findAllActiveMissions, get };

function getTranslatedContent(content, locale) {
  const contentWithTranslatedSteps =
    content?.steps?.map((step) => new MissionStep({ ...step, name: getTranslatedKey(step.name_i18n, locale) })) || [];
  return new MissionContent({ ...content, steps: contentWithTranslatedSteps });
}
