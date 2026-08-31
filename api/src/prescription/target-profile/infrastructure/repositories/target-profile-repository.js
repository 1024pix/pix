import { Badge } from '../../../../evaluation/domain/models/Badge.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError, ObjectValidationError } from '../../../../shared/domain/errors.js';
import { TargetProfile } from '../../../../shared/domain/models/TargetProfile.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { TargetProfileCappedTube } from '../../domain/models/TargetProfileCappedTube.js';

const TARGET_PROFILE_TABLE = 'target-profiles';

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const targetProfile = await knexConn('target-profiles').where({ id }).first();
  const badges = await knexConn('badges').where('targetProfileId', id);

  if (!targetProfile) {
    throw new NotFoundError(`Le profil cible avec l'id ${id} n'existe pas`);
  }

  return new TargetProfile({ ...targetProfile, badges: badges.map((badge) => new Badge(badge)) });
};

const findByIds = async function (targetProfileIds) {
  const knexConn = DomainTransaction.getConnection();

  const targetProfiles = await knexConn('target-profiles').whereIn('id', targetProfileIds);
  return targetProfiles.map((targetProfile) => {
    return new TargetProfile(targetProfile);
  });
};

const findOrganizationIds = async function (targetProfileId) {
  const knexConn = DomainTransaction.getConnection();
  const targetProfile = await knexConn(TARGET_PROFILE_TABLE).select('id').where({ id: targetProfileId }).first();
  if (!targetProfile) {
    throw new NotFoundError(`No target profile for ID ${targetProfileId}`);
  }

  const targetProfileShares = await knexConn('target-profile-shares')
    .select('organizationId')
    .where({ 'target-profile-shares.targetProfileId': targetProfileId });
  return targetProfileShares.map((targetProfileShare) => targetProfileShare.organizationId);
};

// TODO : Add Test on this PLEASE
const hasTubesWithLevels = async function ({ targetProfileId, tubesWithLevels }) {
  const knexConn = DomainTransaction.getConnection();
  const tubeIds = tubesWithLevels.map(({ id }) => id);

  const result = await knexConn('target-profile_tubes')
    .whereIn('tubeId', tubeIds)
    .andWhere('targetProfileId', targetProfileId);

  for (const tubeWithLevel of tubesWithLevels) {
    const targetProfileTube = result.find(({ tubeId }) => tubeId === tubeWithLevel.id);
    if (!targetProfileTube) {
      throw new ObjectValidationError(`Le sujet ${tubeWithLevel.id} ne fait pas partie du profil cible`);
    }

    if (tubeWithLevel.level > targetProfileTube.level) {
      throw new ObjectValidationError(
        `Le niveau ${tubeWithLevel.level} dépasse le niveau max du sujet ${tubeWithLevel.id}`,
      );
    }
  }
};

const findTubeIdsByTargetProfileIds = async (targetProfileIds) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('target-profile_tubes')
    .select('targetProfileId', 'tubeId')
    .whereIn('targetProfileId', targetProfileIds);
};

const findCappedTubesForTargetProfileIds = async (targetProfileIds) => {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('target-profile_tubes').whereIn('targetProfileId', targetProfileIds);
  return result.map((targetProfileCappedTube) => {
    return new TargetProfileCappedTube({ ...targetProfileCappedTube });
  });
};

const findSharedByOrganizationId = async (organizationId) =>
  DomainTransaction.getConnection()('target-profiles')
    .join('target-profile-shares', 'target-profiles.id', 'target-profile-shares.targetProfileId')
    .where('target-profile-shares.organizationId', organizationId)
    .where('outdated', false)
    .select(
      'target-profiles.id',
      'target-profiles.name',
      'target-profiles.category',
      'target-profiles.isSimplifiedAccess',
      'target-profiles.createdAt',
    );

const findSkillsByIds = async function ({ targetProfileIds, dependencies = { skillRepository } }) {
  const knexConn = DomainTransaction.getConnection();

  const cappedTubes = await knexConn('target-profile_tubes')
    .select('tubeId')
    .max('level as level')
    .groupBy('tubeId')
    .whereIn('targetProfileId', targetProfileIds);

  const skillData = [];
  for (const cappedTube of cappedTubes) {
    const allLevelSkills = await dependencies.skillRepository.findActiveByTubeId(cappedTube.tubeId);
    const rightLevelSkills = allLevelSkills.filter((skill) => skill.difficulty <= cappedTube.level);
    skillData.push(...rightLevelSkills);
  }

  return skillData;
};

export {
  findByIds,
  findCappedTubesForTargetProfileIds,
  findOrganizationIds,
  findSharedByOrganizationId,
  findSkillsByIds,
  findTubeIdsByTargetProfileIds,
  get,
  hasTubesWithLevels,
};
