import bluebird from 'bluebird';

import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationBadgeForAdmin } from '../../../../../lib/domain/models/ComplementaryCertificationBadgeForAdmin.js';
import { TargetProfileHistoryForAdmin } from '../../../../../lib/domain/models/TargetProfileHistoryForAdmin.js';

const getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId = async function ({
  complementaryCertificationId,
}) {
  const currentTargetProfiles = await knex('complementary-certification-badges')
    .select({
      id: 'target-profiles.id',
      name: 'target-profiles.name',
    })
    .max('complementary-certification-badges.createdAt', { as: 'attachedAt' })
    .max('complementary-certification-badges.detachedAt', { as: 'detachedAt' })
    .leftJoin('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .leftJoin('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .groupBy('target-profiles.id')
    .where({ complementaryCertificationId })
    .whereNull('complementary-certification-badges.detachedAt')
    .orderBy('attachedAt', 'desc');

  return bluebird.mapSeries(currentTargetProfiles, async (targetProfile) => {
    const badges = await _getTargetProfileComplementaryCertificationBadges({ targetProfile });
    return _toDomain({ targetProfile, badges });
  });
};

const getDetachedTargetProfilesHistoryByComplementaryCertificationId = async function ({
  complementaryCertificationId,
}) {
  const detachedTargetProfiles = await knex('complementary-certification-badges')
    .select({
      id: 'target-profiles.id',
      name: 'target-profiles.name',
      attachedAt: 'complementary-certification-badges.createdAt',
      detachedAt: 'complementary-certification-badges.detachedAt',
    })
    .leftJoin('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .leftJoin('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .where({ complementaryCertificationId })
    .whereNotNull('complementary-certification-badges.detachedAt')
    .groupBy(
      'target-profiles.id',
      'target-profiles.name',
      'complementary-certification-badges.createdAt',
      'complementary-certification-badges.detachedAt',
    )
    .orderBy('attachedAt', 'desc');

  return bluebird.mapSeries(detachedTargetProfiles, async (targetProfile) => {
    const badges = await _getTargetProfileComplementaryCertificationBadges({ targetProfile });
    return _toDomain({ targetProfile, badges });
  });
};

export {
  getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId,
  getDetachedTargetProfilesHistoryByComplementaryCertificationId,
};

async function _getTargetProfileComplementaryCertificationBadges({ targetProfile }) {
  const badgesDTO = await knex('badges')
    .select({
      id: 'badges.id',
      complementaryCertificationBadgeId: 'complementary-certification-badges.id',
      label: 'complementary-certification-badges.label',
      level: 'complementary-certification-badges.level',
      imageUrl: 'complementary-certification-badges.imageUrl',
      minimumEarnedPix: 'complementary-certification-badges.minimumEarnedPix',
    })
    .innerJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .where('targetProfileId', targetProfile.id)
    .orderBy('level', 'asc');

  return badgesDTO.map((badge) => new ComplementaryCertificationBadgeForAdmin({ ...badge }));
}

const _toDomain = ({ targetProfile, badges }) => {
  return new TargetProfileHistoryForAdmin({ ...targetProfile, badges });
};
