import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import { UserCertificabilityCalculator } from '../../domain/models/UserCertificabilityCalculator.js';

export async function getByUserId({ userId }) {
  const userCertificabilityData = await knex('user-certificabilities')
    .select([
      'id',
      'userId',
      'certificability',
      'certificabilityV2',
      'latestKnowledgeElementCreatedAt',
      'latestCertificationDeliveredAt',
      'latestBadgeAcquisitionUpdatedAt',
      'latestComplementaryCertificationBadgeDetachedAt',
    ])
    .where({ userId })
    .first();
  if (!userCertificabilityData) {
    return UserCertificabilityCalculator.buildEmpty({ userId });
  }
  return new UserCertificabilityCalculator({
    id: userCertificabilityData.id,
    userId,
    certificability: userCertificabilityData.certificability,
    certificabilityV2: userCertificabilityData.certificabilityV2,
    latestKnowledgeElementCreatedAt: userCertificabilityData.latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt: userCertificabilityData.latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt: userCertificabilityData.latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt:
      userCertificabilityData.latestComplementaryCertificationBadgeDetachedAt,
  });
}

export async function getActivityDatesForUserId({ userId }) {
  let latestKnowledgeElementCreatedAt = null;
  let latestCertificationDeliveredAt = null;
  let latestBadgeAcquisitionUpdatedAt = null;
  let latestComplementaryCertificationBadgeDetachedAt = null;

  await knex.transaction(async (trx) => {
    const latestKnowledgeElementData = await trx('knowledge-elements')
      .select('createdAt')
      .where({ userId })
      .orderBy('createdAt', 'DESC')
      .limit(1);
    if (latestKnowledgeElementData.length !== 0) {
      latestKnowledgeElementCreatedAt = latestKnowledgeElementData[0].createdAt;
    }

    const latestCertificationData = await trx('certification-courses')
      .select({ deliveredAt: 'sessions.publishedAt' })
      .join('sessions', 'sessions.id', 'certification-courses.sessionId')
      .where('certification-courses.userId', userId)
      .whereNotNull('sessions.publishedAt')
      .orderBy('sessions.publishedAt', 'DESC')
      .limit(1);

    if (latestCertificationData.length !== 0) {
      latestCertificationDeliveredAt = latestCertificationData[0].deliveredAt;
    }

    const latestBadgeAcquisitionData = await trx('badge-acquisitions')
      .select({ updatedAt: 'badge-acquisitions.updatedAt' })
      .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
      .where('badges.isCertifiable', true)
      .where('badge-acquisitions.userId', userId)
      .whereNotNull('badge-acquisitions.updatedAt')
      .orderBy('badge-acquisitions.updatedAt', 'DESC')
      .limit(1);

    if (latestBadgeAcquisitionData.length !== 0) {
      latestBadgeAcquisitionUpdatedAt = latestBadgeAcquisitionData[0].updatedAt;
    }

    const latestComplementaryCertificationBadgeData = await trx('complementary-certification-badges')
      .select({ detachedAt: 'complementary-certification-badges.detachedAt' })
      .whereNotNull('complementary-certification-badges.detachedAt')
      .orderBy('complementary-certification-badges.detachedAt', 'DESC')
      .limit(1);

    if (latestComplementaryCertificationBadgeData.length !== 0) {
      latestComplementaryCertificationBadgeDetachedAt = latestComplementaryCertificationBadgeData[0].detachedAt;
    }
  });

  return {
    latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt,
  };
}

export async function save(userCertificabilityCalculator) {
  const dataToInsert = adaptModelToDB(userCertificabilityCalculator);
  if (!userCertificabilityCalculator.id) {
    delete dataToInsert.id;
    await knex('user-certificabilities').insert(dataToInsert);
  } else {
    dataToInsert.updatedAt = new Date();
    await knex('user-certificabilities').update(dataToInsert).where({ id: dataToInsert.id });
  }
}

export async function getHighestPixScoreObtainedInCoreCertification({ userId }) {
  const highestPixScoreObtainedInCoreCertificationData = await knex('certification-courses')
    .select({ pixScore: 'assessment-results.pixScore' })
    .join(
      'certification-courses-last-assessment-results',
      'certification-courses-last-assessment-results.certificationCourseId',
      'certification-courses.id',
    )
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .whereNotNull('assessment-results.pixScore')
    .where('certification-courses.userId', userId)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false)
    .where('certification-courses.isRejectedForFraud', false)
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .orderBy('assessment-results.pixScore', 'DESC')
    .limit(1);

  if (highestPixScoreObtainedInCoreCertificationData.length !== 0) {
    return highestPixScoreObtainedInCoreCertificationData[0].pixScore;
  } else {
    return -1;
  }
}

export async function findMinimumEarnedPixValuesByComplementaryCertificationBadgeId() {
  const res = await knex('complementary-certification-badges')
    .select(['id', 'minimumEarnedPix'])
    .whereNull('complementary-certification-badges.detachedAt');
  const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {};
  for (const item of res) {
    minimumEarnedPixValuesByComplementaryCertificationBadgeId[item.id] = item.minimumEarnedPix;
  }
  return minimumEarnedPixValuesByComplementaryCertificationBadgeId;
}

export async function findHowManyVersionsBehindByComplementaryCertificationBadgeId() {
  const howManyVersionsBehindByComplementaryCertificationBadgeId = {};
  const allComplementaryCertificationBadgeData = await knex('complementary-certification-badges').select([
    'id',
    'level',
    'complementaryCertificationId',
    'detachedAt',
  ]);
  const groupedByLevelAndComplementaryCertificationId = _.groupBy(
    allComplementaryCertificationBadgeData,
    ({ level, complementaryCertificationId }) => `${level}_${complementaryCertificationId}`,
  );
  for (const sameLevelComplementaryBadgesData of Object.values(groupedByLevelAndComplementaryCertificationId)) {
    const sortedByDetachedAtDescNullFirst = sameLevelComplementaryBadgesData.sort(sortByDetachedAtDescNullsFirst);
    let versionsBehind = sortedByDetachedAtDescNullFirst[0].detachedAt === null ? 0 : 1;
    for (const { id } of sortedByDetachedAtDescNullFirst) {
      howManyVersionsBehindByComplementaryCertificationBadgeId[id] = versionsBehind;
      ++versionsBehind;
    }
  }
  return howManyVersionsBehindByComplementaryCertificationBadgeId;
}

function adaptModelToDB(userCertificabilityCalculator) {
  return {
    id: userCertificabilityCalculator.id,
    userId: userCertificabilityCalculator.userId,
    certificability: JSON.stringify(userCertificabilityCalculator.draftCertificability),
    certificabilityV2: JSON.stringify(userCertificabilityCalculator.draftCertificabilityV2),
    latestKnowledgeElementCreatedAt: userCertificabilityCalculator.latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt: userCertificabilityCalculator.latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt: userCertificabilityCalculator.latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt:
      userCertificabilityCalculator.latestComplementaryCertificationBadgeDetachedAt,
  };
}

function sortByDetachedAtDescNullsFirst(dataA, dataB) {
  if (dataA.detachedAt === null) return -1;
  if (dataB.detachedAt === null) return 1;
  return dataA.detachedAt.getTime() > dataB.detachedAt.getTime() ? -1 : 1;
}
