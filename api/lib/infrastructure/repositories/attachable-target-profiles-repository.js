import { _ } from '../utils/lodash-utils.js';
import { knex } from '../../../db/knex-database-connection.js';
import { AttachableTargetProfile } from '../../domain/models/AttachableTargetProfile.js';

const find = async function ({ searchTerm } = {}) {
  const targetProfiles = await knex('target-profiles')
    .select('target-profiles.id', 'target-profiles.name')
    .leftJoin('badges', 'target-profiles.id', 'badges.targetProfileId')
    .leftJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .orderBy('target-profiles.name', 'ASC')
    .orderBy('target-profiles.id', 'DESC')
    .where('target-profiles.outdated', false)
    .where((builder) => _includeNeverAttachedTargetProfile(builder).orWhere(_includeDetachedTargetProfile))
    .where((builder) => _searchByCritieria({ builder, searchTerm }));

  return _toDomain(targetProfiles);
};

export { find };

function _searchByCritieria({ builder, searchTerm }) {
  if (!_.isBlank(searchTerm)) {
    const filteredBuilder = _searchByTargetProfileName({ builder, searchTerm });
    const isNumberOnly = /^\d+$/.test(searchTerm);
    if (isNumberOnly) {
      return filteredBuilder.orWhere((builder) => _searchOnId({ builder, searchTerm }));
    }

    return filteredBuilder;
  }
  return builder;
}
function _searchByTargetProfileName({ builder, searchTerm }) {
  return builder.whereILike('target-profiles.name', `%${searchTerm}%`);
}

function _searchOnId({ builder, searchTerm }) {
  return builder.whereRaw('CAST("target-profiles"."id" AS TEXT) LIKE ?', [`%${searchTerm}%`]);
}

function _includeNeverAttachedTargetProfile(builder) {
  return builder.whereNull('complementary-certification-badges.badgeId');
}

function _includeDetachedTargetProfile(builder) {
  return builder
    .whereNotNull('badges.targetProfileId')
    .andWhereNot('complementary-certification-badges.detachedAt', null);
}

function _toDomain(targetProfiles) {
  return targetProfiles.map((targetProfile) => new AttachableTargetProfile(targetProfile));
}
