import CertifiableBadgeAcquisition from '../../domain/models/CertifiableBadgeAcquisition';
import { knex } from '../../../db/knex-database-connection';
import DomainTransaction from '../DomainTransaction';
import _ from 'lodash';

const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';

export default {
  async findHighestCertifiable({ userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
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
        'complementary-certification-badges.complementaryCertificationId'
      )
      .join('campaign-participations', 'campaign-participations.id', 'badge-acquisitions.campaignParticipationId')
      .where({
        'badge-acquisitions.userId': userId,
        'badges.isCertifiable': true,
      })
      .whereRaw(
        `"badge-acquisitions"."createdAt" =
            (select max(ba."createdAt") from "complementary-certification-badges" ccb
            join "badges" b on ccb."badgeId" = b.id
            join "badge-acquisitions" ba on ba."badgeId" = b.id
            where "complementary-certification-badges"."complementaryCertificationId" = ccb."complementaryCertificationId"
            and ba."userId" = ? and b."isCertifiable" = true)
        `,
        userId
      );

    const highestCertifiableBadgeAcquisitionByComplementaryCertificationId = _(certifiableBadgeAcquisitions)
      .groupBy('complementaryCertificationId')
      .values()
      .map((certifiableBadgeAcquisitionByComplementaryCertifications) =>
        _.maxBy(certifiableBadgeAcquisitionByComplementaryCertifications, 'complementaryCertificationBadgeLevel')
      )
      .flatten()
      .value();

    return _toDomain(highestCertifiableBadgeAcquisitionByComplementaryCertificationId);
  },
};

function _toDomain(certifiableBadgeAcquisitionsDto) {
  return certifiableBadgeAcquisitionsDto.map(
    (certifiableBadgeAcquisitionDto) => new CertifiableBadgeAcquisition(certifiableBadgeAcquisitionDto)
  );
}
