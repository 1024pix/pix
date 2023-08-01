import { knex } from '../../../db/knex-database-connection.js';
import { TargetProfileAttachableForAdmin } from '../../domain/models/TargetProfileAttachableForAdmin.js';

const find = async function () {
  const queryBuilder = knex('target-profiles')
    .select('target-profiles.id', 'target-profiles.name')
    .leftJoin('badges', 'target-profiles.id', 'badges.targetProfileId')
    .leftJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .orderBy('target-profiles.name', 'ASC')
    .orderBy('target-profiles.id', 'DESC');

  queryBuilder.andWhere((queryBuilder) => {
    return _excludeOutdatedTargetProfiles(queryBuilder).andWhere((queryBuilder) => {
      return _includeWhenNotLinkedToAComplementaryCertification(queryBuilder).orWhere(
        _excludeTargetProfilesWhenLinkedToAComplementaryCertificationButDetached,
      );
    });
  });

  const targetProfiles = await queryBuilder;
  return _toDomain(targetProfiles);
};

export { find };

function _excludeOutdatedTargetProfiles(queryBuilder) {
  return queryBuilder.where('target-profiles.outdated', false);
}

function _includeWhenNotLinkedToAComplementaryCertification(queryBuilder) {
  return queryBuilder.whereNull('badges.targetProfileId');
}

function _excludeTargetProfilesWhenLinkedToAComplementaryCertificationButDetached(queryBuilder) {
  return queryBuilder
    .whereNotNull('badges.targetProfileId')
    .andWhereNot('complementary-certification-badges.detachedAt', null);
}

function _toDomain(targetProfiles) {
  return targetProfiles.map((targetProfile) => new TargetProfileAttachableForAdmin(targetProfile));
}
