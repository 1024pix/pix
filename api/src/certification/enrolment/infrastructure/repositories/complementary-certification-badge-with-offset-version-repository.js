// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationBadgeWithOffsetVersion } from '../../domain/models/ComplementaryCertificationBadge.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.complementaryCertificationBadgeId
 * @returns {Promise<Array<ComplementaryCertificationBadgeWithOffsetVersion>>}
 */
export async function getAllWithSameTargetProfile({ complementaryCertificationBadgeId }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('complementary-certification-badges')
    .select(
      'complementary-certification-badges.id',
      'complementary-certification-badges.minimumEarnedPix',
      'complementary-certification-badges.level',
      'complementary-certification-badges.label',
      'complementary-certification-badges.imageUrl',
      'complementary-certification-badges.detachedAt',
      knexConn.raw(
        '(rank() over (partition by "complementaryCertificationId", "level" ORDER BY "detachedAt" DESC NULLS FIRST)) - 1 as "offsetVersion"',
      ),
    )
    .join('badges', 'badges.id', '=', 'complementary-certification-badges.badgeId')
    .where(
      'badges.targetProfileId',
      '=',
      knexConn('complementary-certification-badges')
        .select('target-profiles.id')
        .join('badges', 'badges.id', '=', 'complementary-certification-badges.badgeId')
        .join('target-profiles', 'target-profiles.id', '=', 'badges.targetProfileId')
        .where('complementary-certification-badges.id', '=', complementaryCertificationBadgeId),
    )
    .orderBy('complementary-certification-badges.id');

  return results.map(_toDomain);
}

/**
 * @typedef {object} ComplementaryCertificationBadgeWithOffsetVersionDTO
 * @property {number} id
 * @property {number} minimumEarnedPix
 * @property {number} offsetVersion
 * @property {number} level
 * @property {string} label
 * @property {string} imageUrl
 * @property {Date} detachedAt
 */

/**
 * @function
 * @param {ComplementaryCertificationBadgeWithOffsetVersionDTO} data
 * @returns {ComplementaryCertificationBadgeWithOffsetVersion}
 */
function _toDomain(data) {
  return new ComplementaryCertificationBadgeWithOffsetVersion({
    id: data.id,
    requiredPixScore: data?.minimumEarnedPix || 0,
    offsetVersion: data.offsetVersion,
    level: data.level,
    label: data.label,
    imageUrl: data.imageUrl,
    isOutdated: !!data.detachedAt,
  });
}
