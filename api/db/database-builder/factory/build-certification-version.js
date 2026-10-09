import { PIX_COUNT_BY_LEVEL } from '../../../src/shared/constants.js';
import { databaseBuffer } from '../database-buffer.js';

export function buildCertificationVersion({
  id = databaseBuffer.getNextId(),
  scope,
  startDate,
  expirationDate,
  assessmentDuration,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  challengesConfiguration,
  minimumAnswersRequiredToValidateACertification,
  externalCalibrationId = null,
  status,
  comments,
} = {}) {
  const maxReachableLevel = globalScoringConfiguration?.length ? globalScoringConfiguration.length - 1 : null;
  const maxReachablePixScore =
    maxReachableLevel !== null && competencesScoringConfiguration?.length
      ? maxReachableLevel * competencesScoringConfiguration.length * PIX_COUNT_BY_LEVEL - 1
      : null;

  return databaseBuffer.pushInsertable({
    tableName: 'certification_versions',
    values: {
      id,
      scope,
      startDate,
      expirationDate,
      assessmentDuration,
      globalScoringConfiguration: JSON.stringify(globalScoringConfiguration),
      competencesScoringConfiguration: JSON.stringify(competencesScoringConfiguration),
      challengesConfiguration: JSON.stringify(challengesConfiguration),
      minimumAnswersRequiredToValidateACertification,
      externalCalibrationId,
      status,
      comments,
      maxReachableLevel,
      maxReachablePixScore,
    },
  });
}
