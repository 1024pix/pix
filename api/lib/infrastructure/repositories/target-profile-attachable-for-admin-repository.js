import { knex } from '../../../db/knex-database-connection.js';
import { TargetProfileAttachableForAdmin } from '../../domain/models/TargetProfileAttachableForAdmin.js';

const find = async function ({ searchTerm } = {}) {
  const targetProfilesSearchQuery = knex('target-profiles')
    .select('target-profiles.id', 'target-profiles.name')
    .leftJoin('badges', 'target-profiles.id', 'badges.targetProfileId')
    .leftJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .orderBy('target-profiles.name', 'ASC')
    .orderBy('target-profiles.id', 'DESC');

  targetProfilesSearchQuery.andWhere((queryBuilder) => {
    return _excludeAllOutdatedTargetProfiles(queryBuilder).andWhere((queryBuilder) => {
      return _includeAllTargetProfilesNotLinkedToAComplementaryCertification(queryBuilder).orWhere(
        _includeTargetProfileLinkedToAComplementaryOnlyWhenDetached,
      );
    });
  });

  if (searchTerm) {
    targetProfilesSearchQuery.andWhere((queryBuilder) => {
      queryBuilder.whereILike('name', `%${searchTerm}%`);
    });
  }

  const targetProfiles = await targetProfilesSearchQuery;
  return _toDomain(targetProfiles);
};

export { find };

function _excludeAllOutdatedTargetProfiles(queryBuilder) {
  return queryBuilder.where('target-profiles.outdated', false);
}

function _includeAllTargetProfilesNotLinkedToAComplementaryCertification(queryBuilder) {
  return queryBuilder.whereNull('badges.targetProfileId');
}

function _includeTargetProfileLinkedToAComplementaryOnlyWhenDetached(queryBuilder) {
  return queryBuilder
    .whereNotNull('badges.targetProfileId')
    .andWhereNot('complementary-certification-badges.detachedAt', null);
}

function _toDomain(targetProfiles) {
  return targetProfiles.map((targetProfile) => new TargetProfileAttachableForAdmin(targetProfile));
}
