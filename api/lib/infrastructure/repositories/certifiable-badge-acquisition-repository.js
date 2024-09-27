import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { CertifiableBadgeAcquisition } from '../../../src/shared/domain/models/CertifiableBadgeAcquisition.js';
import { DomainTransaction } from '../DomainTransaction.js';

const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';

/**
 * @returns {Array<CertifiableBadgeAcquisition>} highest complementary certification badges a user acquired
 */
const findHighestCertifiable = async function ({ userId, limitDate = new Date() }) {
  const knexConn = DomainTransaction.getConnection();
  const certifiableBadgeAcquisitions = await knexConn
    .with('user-badges', (qb) => {
      qb.from(BADGE_ACQUISITIONS_TABLE)
        .select({
          id: 'badges.id',
          key: 'badges.key',
          acquiredAt: 'badge-acquisitions.createdAt',
          campaignParticipationId: 'badge-acquisitions.campaignParticipationId',
          complementaryCertificationId: 'complementary-certification-badges.complementaryCertificationId',
          complementaryCertificationBadgeId: 'complementary-certification-badges.id',
          complementaryCertificationBadgeImageUrl: 'complementary-certification-badges.imageUrl',
          complementaryCertificationBadgeLabel: 'complementary-certification-badges.label',
          complementaryCertificationBadgeLevel: 'complementary-certification-badges.level',
          complementaryCertificationBadgeDetachedAt: 'complementary-certification-badges.detachedAt',
        })
        .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
        .join('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
        .where('badge-acquisitions.createdAt', '<=', limitDate)
        .where({
          'badge-acquisitions.userId': userId,
          'badges.isCertifiable': true,
        });
    })
    .with('latest-acquiredAt-badges', (qb) => {
      qb.from('user-badges')
        .select('complementaryCertificationId')
        .max('acquiredAt', { as: 'acquiredAt' })
        .groupBy('complementaryCertificationId');
    })
    .from('user-badges')
    .select({
      badgeId: 'user-badges.id',
      badgeKey: 'user-badges.key',
      campaignId: 'campaign-participations.campaignId',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationBadgeId: 'user-badges.complementaryCertificationBadgeId',
      complementaryCertificationBadgeImageUrl: 'user-badges.complementaryCertificationBadgeImageUrl',
      complementaryCertificationBadgeLabel: 'user-badges.complementaryCertificationBadgeLabel',
      complementaryCertificationBadgeLevel: 'user-badges.complementaryCertificationBadgeLevel',
      complementaryCertificationBadgeDetachedAt: 'user-badges.complementaryCertificationBadgeDetachedAt',
    })
    .join('complementary-certifications', 'complementary-certifications.id', 'user-badges.complementaryCertificationId')
    .join('campaign-participations', 'campaign-participations.id', 'user-badges.campaignParticipationId')
    .where({
      'user-badges.acquiredAt': knex('latest-acquiredAt-badges')
        .select('acquiredAt')
        .whereRaw(
          '"latest-acquiredAt-badges"."complementaryCertificationId" = "user-badges"."complementaryCertificationId"',
        ),
    });

  const highestCertifiableBadgeAcquisitionByComplementaryCertificationId = _(certifiableBadgeAcquisitions)
    .groupBy('complementaryCertificationId')
    .values()
    .map((certifiableBadgeAcquisitionByComplementaryCertifications) =>
      _.maxBy(certifiableBadgeAcquisitionByComplementaryCertifications, 'complementaryCertificationBadgeLevel'),
    )
    .flatten()
    .value();

  return _toDomain(highestCertifiableBadgeAcquisitionByComplementaryCertificationId);
};

export { findHighestCertifiable };

function _toDomain(certifiableBadgeAcquisitionsDto) {
  return certifiableBadgeAcquisitionsDto.map(
    (certifiableBadgeAcquisitionDto) =>
      new CertifiableBadgeAcquisition({
        ...certifiableBadgeAcquisitionDto,
        isOutdated: !!certifiableBadgeAcquisitionDto.complementaryCertificationBadgeDetachedAt,
      }),
  );
}
