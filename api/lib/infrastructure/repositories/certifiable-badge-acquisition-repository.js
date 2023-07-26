import { CertifiableBadgeAcquisition } from '../../domain/models/CertifiableBadgeAcquisition.js';
import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';
import _ from 'lodash';

const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';

const findHighestCertifiable = async function ({
  userId,
  limitDate = new Date(),
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const certifiableBadgeAcquisitions = await knexConn(BADGE_ACQUISITIONS_TABLE)
    .select({
      badgeId: 'badges.id',
      badgeKey: 'badges.key',
      campaignId: 'campaign-participations.campaignId',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationBadgeId: 'complementary-certification-badges.id',
      complementaryCertificationBadgeImageUrl: 'complementary-certification-badges.imageUrl',
      complementaryCertificationBadgeLabel: 'complementary-certification-badges.label',
      complementaryCertificationBadgeLevel: 'complementary-certification-badges.level',
    })
    .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
    .join('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .join('campaign-participations', 'campaign-participations.id', 'badge-acquisitions.campaignParticipationId')
    .where({
      'badge-acquisitions.userId': userId,
      'badges.isCertifiable': true,
    })
    .where({
      'badge-acquisitions.createdAt': knex('complementary-certification-badges AS ccb')
        .max('badge-acquisitions.createdAt')
        .join('badges', 'ccb.badgeId', 'badges.id')
        .join('badge-acquisitions', 'badge-acquisitions.badgeId', 'badges.id')
        .whereRaw(
          'ccb."complementaryCertificationId" = "complementary-certification-badges"."complementaryCertificationId"',
        )
        .where({ 'badge-acquisitions.userId': userId })
        .where('ba.createdAt', '<=', limitDate)
        .where({ 'badges.isCertifiable': true }),
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
    (certifiableBadgeAcquisitionDto) => new CertifiableBadgeAcquisition(certifiableBadgeAcquisitionDto),
  );
}
