import { Version } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { buildFlashAlgorithmConfiguration } from '../../build-flash-algorithm-configuration.js';

export const buildVersion = ({
  id = 1,
  scope = SCOPES.CORE,
  startDate = new Date(),
  expirationDate,
  assessmentDuration = 105,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  challengesConfiguration,
} = {}) => {
  return new Version({
    id,
    scope,
    startDate,
    expirationDate,
    assessmentDuration,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    challengesConfiguration: buildFlashAlgorithmConfiguration(challengesConfiguration),
  });
};
