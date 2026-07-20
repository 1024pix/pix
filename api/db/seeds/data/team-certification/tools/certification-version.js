import { VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { versionBuilder } from '../../../../../tests/tooling/domain-builder/factory/certification/configuration/build-version.js';
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
  const version = versionBuilder().withParameters({
    scope,
    tubeIds: [],
    assessmentDuration,
    challengesConfiguration,
    globalScoringConfiguration,
    competencesScoringConfiguration,
  });

  if (status === VERSION_STATUSES.ACTIVE) {
    version.asActive({ startDate: new Date() });
  }

  if (status === VERSION_STATUSES.ARCHIVED) {
    version.asArchived({ startDate: new Date('2018-01-01'), expirationDate: new Date('2019-01-01') });
  }

  return version.insertToDB({ databaseBuilder });
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
