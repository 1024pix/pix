import { Version, VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION } from '../../../../../src/certification/shared/domain/constants.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {number} params.status - certification center member user id
 * @returns {Promise<Version>}
 */
export async function createVersion({
  databaseBuilder,
  status = VERSION_STATUSES.DRAFT,
  scope = 'CORE',
  assessmentDuration,
  challengesConfiguration,
  globalScoringConfiguration,
  competencesScoringConfiguration,
}) {
  const version = new Version({
    scope,
    status,
    challengesConfiguration: new FlashAssessmentAlgorithmConfiguration(challengesConfiguration),
    globalScoringConfiguration,
    competencesScoringConfiguration,
    assessmentDuration,
    minimumAnswersRequiredToValidateACertification: DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  });

  if (status === VERSION_STATUSES.DRAFT) {
    version.startDate = null;
    version.expirationDate = null;
  }

  if (status === VERSION_STATUSES.ACTIVE) {
    version.startDate = new Date();
    version.expirationDate = null;
  }

  if (status === VERSION_STATUSES.ARCHIVED) {
    version.startDate = new Date('2018-01-01');
    version.expirationDate = new Date('2019-01-01');
  }

  delete version.id;

  const createdVersion = databaseBuilder.factory.buildCertificationVersion(version);

  return createdVersion;
}

export async function seedVersionChallengesAndTubes({ databaseBuilder, challengeIds, versionId }) {
  if (challengeIds.length === 0) {
    return;
  }

  for (const challengeId of challengeIds) {
    databaseBuilder.factory.buildCertificationFrameworksChallenge({ challengeId, versionId });
  }

  const tubeIds = await databaseBuilder
    .knex({ skills: 'learningcontent.skills' })
    .join({ challenges: 'learningcontent.challenges' }, 'challenges.skillId', 'skills.id')
    .whereIn('challenges.id', challengeIds)
    .pluck('skills.tubeId');

  for (const tubeId of new Set(tubeIds)) {
    databaseBuilder.factory.buildCertificationVersionTube({ tubeId, versionId });
  }
}
