import { Version as VersionApi } from '../../../../../../src/certification/configuration/application/api/models/Version.js';
import { Version, VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { buildFlashAlgorithmConfiguration } from '../../build-flash-algorithm-configuration.js';

export const buildVersion = ({
  id = 1,
  scope = SCOPES.CORE,
  startDate = null,
  expirationDate = null,
  assessmentDuration = 105,
  minimumAnswersRequiredToValidateACertification = 20,
  globalScoringConfiguration = [],
  competencesScoringConfiguration = [],
  challengesConfiguration = {},
  status = VERSION_STATUSES.DRAFT,
  comments = 'Some comments',
} = {}) => {
  return new Version({
    id,
    scope,
    startDate,
    expirationDate,
    assessmentDuration,
    minimumAnswersRequiredToValidateACertification,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    challengesConfiguration: buildFlashAlgorithmConfiguration(challengesConfiguration),
    status,
    comments,
  });
};

buildVersion.api = ({
  id = 1,
  scope = SCOPES.CORE,
  startDate = new Date(),
  expirationDate,
  assessmentDuration = 105,
  minimumAnswersRequiredToValidateACertification = 20,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  challengesConfiguration,
  status = VERSION_STATUSES.DRAFT,
  comments = 'Some comments',
} = {}) => {
  const baseVersion = new Version({
    id,
    scope,
    startDate,
    expirationDate,
    assessmentDuration,
    minimumAnswersRequiredToValidateACertification,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    status,
    comments,
    challengesConfiguration: buildFlashAlgorithmConfiguration(challengesConfiguration),
  });
  return new VersionApi(baseVersion);
};
