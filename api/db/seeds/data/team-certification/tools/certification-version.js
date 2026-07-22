import { Version, VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION } from '../../../../../src/certification/shared/domain/constants.js';
/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {string} [params.status] - one of VERSION_STATUSES, defaults to DRAFT
 * @param {string} [params.scope]
 * @param {number} [params.assessmentDuration]
 * @param {Object} [params.challengesConfiguration]
 * @param {Array<Object>} [params.globalScoringConfiguration]
 * @param {Array<Object>} [params.competencesScoringConfiguration]
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
    tubeIds: [],
    assessmentDuration,
    minimumAnswersRequiredToValidateACertification: DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    challengesConfiguration,
    status: VERSION_STATUSES.DRAFT,
  });

  if (status === VERSION_STATUSES.ACTIVE) {
    version.status = VERSION_STATUSES.ACTIVE;
    version.startDate = new Date();
    version.expirationDate = null;
  }

  if (status === VERSION_STATUSES.ARCHIVED) {
    version.status = VERSION_STATUSES.ARCHIVED;
    version.startDate = new Date('2018-01-01');
    version.expirationDate = new Date('2019-01-01');
  }

  const row = databaseBuilder.factory.buildCertificationVersion({
    id: version.id ?? undefined,
    scope: version.scope,
    startDate: version.startDate,
    expirationDate: version.expirationDate,
    assessmentDuration: version.assessmentDuration,
    minimumAnswersRequiredToValidateACertification: version.minimumAnswersRequiredToValidateACertification,
    globalScoringConfiguration: version.globalScoringConfiguration,
    competencesScoringConfiguration: version.competencesScoringConfiguration,
    challengesConfiguration: version.challengesConfiguration,
    status: version.status,
    comments: version.comments,
  });

  for (const tubeId of version.tubeIds) {
    databaseBuilder.factory.buildCertificationVersionTube({
      versionId: row.id,
      tubeId,
    });
  }

  version.id = row.id;
  return version;
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
