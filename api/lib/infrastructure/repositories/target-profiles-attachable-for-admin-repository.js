import { _ } from '../utils/lodash-utils.js';
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

  if (!_.isBlank(searchTerm)) {
    targetProfilesSearchQuery.andWhere((builder) => {
      return _searchByTargetProfileName({ builder, searchTerm }).orWhere((builder) => {
        _searchOnIdColumnWhenSearchTermsContainsOnlyNumbers({ builder, searchTerm });
      });
    });
  }

  const targetProfiles = await targetProfilesSearchQuery;
  return _toDomain(targetProfiles);
};

export { find };

function _searchByTargetProfileName({ builder, searchTerm }) {
  return builder.whereILike('target-profiles.name', `%${searchTerm}%`);
}

function _searchOnIdColumnWhenSearchTermsContainsOnlyNumbers({ builder, searchTerm }) {
  if (/^\d+$/.test(searchTerm)) {
    return builder.whereRaw('CAST("target-profiles"."id" AS TEXT) LIKE ?', [`%${searchTerm}%`]);
  }

  return builder;
}

function _excludeAllOutdatedTargetProfiles(builder) {
  return builder.where('target-profiles.outdated', false);
}

function _includeAllTargetProfilesNotLinkedToAComplementaryCertification(builder) {
  return builder.whereNull('badges.targetProfileId');
}

function _includeTargetProfileLinkedToAComplementaryOnlyWhenDetached(builder) {
  return builder
    .whereNotNull('badges.targetProfileId')
    .andWhereNot('complementary-certification-badges.detachedAt', null);
}

function _toDomain(targetProfiles) {
  return targetProfiles.map((targetProfile) => new TargetProfileAttachableForAdmin(targetProfile));
}
