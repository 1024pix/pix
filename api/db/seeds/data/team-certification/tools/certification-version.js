import { Version } from '../../../../../src/certification/configuration/domain/models/Version.js';
import {
  DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../../../src/certification/shared/domain/constants.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {number} params.status - certification center member user id
 * @returns {Promise<Version>}
 */
export async function createVersion({
  databaseBuilder,
  status = 'DRAFT',
  scope = 'CORE',
  challengesConfiguration,
  globalScoringConfiguration,
  competencesScoringConfiguration,
}) {
  const version = new Version({
    scope,
    challengesConfiguration: new FlashAssessmentAlgorithmConfiguration(challengesConfiguration),
    globalScoringConfiguration,
    competencesScoringConfiguration,
    assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
    minimumAnswersRequiredToValidateACertification: DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  });

  if (status === 'DRAFT') {
    version.startDate = null;
    version.expirationDate = null;
  }

  if (status === 'ACTIVE') {
    version.startDate = new Date();
    version.expirationDate = null;
  }

  if (status === 'ARCHIVED') {
    version.startDate = new Date('2018-01-01');
    version.expirationDate = new Date('2019-01-01');
  }

  delete version.id;

  const createdVersion = databaseBuilder.factory.buildCertificationVersion(version);

  return createdVersion;
}

export async function linkChallengesAndVersionFromTubeIds({ databaseBuilder, challengeIds, versionId }) {
  for (const challengeId of challengeIds) {
    databaseBuilder.factory.buildCertificationFrameworksChallenge({ challengeId, versionId });
  }
}
