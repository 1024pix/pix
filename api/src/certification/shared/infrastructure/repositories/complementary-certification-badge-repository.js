import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ComplementaryCertificationBadge } from '../../domain/models/ComplementaryCertificationBadge.js';

export const getAllWithSameTargetProfile = async (complementaryCertificationBadgeId) => {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertificationBadges = await knexConn('complementary-certification-badges')
    .select('complementary-certification-badges.*')
    .join('badges', 'badges.id', '=', 'complementary-certification-badges.badgeId')
    .where(
      'badges.targetProfileId',
      '=',
      knexConn('complementary-certification-badges')
        .select('target-profiles.id')
        .join('badges', 'badges.id', '=', 'complementary-certification-badges.badgeId')
        .join('target-profiles', 'target-profiles.id', '=', 'badges.targetProfileId')
        .where('complementary-certification-badges.id', '=', complementaryCertificationBadgeId),
    );

  if (complementaryCertificationBadges.length === 0) {
    throw new NotFoundError('No complementary certification badge found');
  }

  return complementaryCertificationBadges.map(_toDomain);
};

function _toDomain(complementaryCertificationBadgeDTO) {
  return new ComplementaryCertificationBadge(complementaryCertificationBadgeDTO);
}
