import { Version } from '../../../../../src/certification/configuration/domain/models/Version.js';

/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {number} params.status - certification center member user id
 * @returns {Promise<Version>}
 */
export async function createVersion({ databaseBuilder, status = 'DRAFT', scope = 'CORE' }) {
  const version = Version.buildFromVersion({ scope });
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

  await databaseBuilder.commit();

  return createdVersion;
}

export async function linkChallengesAndVersionFromTubeIds({ databaseBuilder, tubeIds, versionId }) {
  const skillIds = await databaseBuilder.knex.pluck('id').from('learningcontent.skills').whereIn('tubeId', tubeIds);
  const challengeIds = await databaseBuilder.knex
    .pluck('id')
    .from('learningcontent.challenges')
    .whereIn('skillId', skillIds);
  challengeIds.forEach(({ id }) => id);

  for (const challengeId of challengeIds) {
    await databaseBuilder.knex('certification-frameworks-challenges').insert({ challengeId, versionId });
  }
  await databaseBuilder.commit();
}
