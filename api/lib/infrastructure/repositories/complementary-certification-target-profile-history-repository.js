import { ComplementaryCertificationTargetProfileHistory } from '../../domain/models/ComplementaryCertificationTargetProfileHistory.js';
import { knex } from '../../../db/knex-database-connection.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';
import { TargetProfileHistoryForAdmin } from '../../domain/models/TargetProfileHistoryForAdmin.js';
import { ComplementaryCertificationBadgeForAdmin } from '../../domain/models/ComplementaryCertificationBadgeForAdmin.js';

const getByComplementaryCertificationId = async function ({ complementaryCertificationId }) {
  const targetProfiles = await knex('complementary-certification-badges')
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
    .orderBy('attachedAt', 'desc');

  const currentTargetProfiles = targetProfiles.filter((targetProfile) => !targetProfile.detachedAt);

  for (const currentTargetProfile of currentTargetProfiles) {
    currentTargetProfile.badges = await _getBadgesForCurrentTargetProfiles({ currentTargetProfile });
  }

  const complementaryCertificationDTO = await knex
    .from('complementary-certifications')
    .where({ id: complementaryCertificationId })
    .first();

  const targetProfilesHistory = targetProfiles.map((targetProfile) => new TargetProfileHistoryForAdmin(targetProfile));
  const complementaryCertification = new ComplementaryCertification(complementaryCertificationDTO);
  return new ComplementaryCertificationTargetProfileHistory({
    ...complementaryCertification,
    targetProfilesHistory,
  });
};

export { getByComplementaryCertificationId };

async function _getBadgesForCurrentTargetProfiles({ currentTargetProfile }) {
  const badgesDTO = await knex('badges')
    .select({
      id: 'badges.id',
      label: 'complementary-certification-badges.label',
      level: 'complementary-certification-badges.level',
    })
    .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .where('targetProfileId', currentTargetProfile.id);

  return badgesDTO.map((badge) => new ComplementaryCertificationBadgeForAdmin({ ...badge }));
}
