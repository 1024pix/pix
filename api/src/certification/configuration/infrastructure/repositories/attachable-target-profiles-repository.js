// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { isBlank } from '../../../../shared/infrastructure/utils/lodash-utils.js';
import { AttachableTargetProfile } from '../../domain/models/AttachableTargetProfile.js';

/**
 * @param {object} params
 * @param {string} [params.searchTerm]
 * @returns {Promise<Array<AttachableTargetProfile>>}
 */
const find = async function ({ searchTerm } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const targetProfiles = await knexConn('target-profiles')
    .select('target-profiles.id', 'target-profiles.name')
    .distinct()
    .leftJoin('badges', 'target-profiles.id', 'badges.targetProfileId')
    .leftJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where('target-profiles.outdated', false)
    .where(_allowOnlyNeverAttachedTargetProfiles)
    .where((builder) => _searchByCriteria({ builder, searchTerm }))
    .orderBy('target-profiles.name', 'ASC')
    .orderBy('target-profiles.id', 'DESC');

  return _toDomain(targetProfiles);
};

export { find };

function _searchByCriteria({ builder, searchTerm }) {
  if (!isBlank(searchTerm)) {
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

function _allowOnlyNeverAttachedTargetProfiles(builder) {
  return builder.whereNull('complementary-certification-badges.badgeId');
}

function _toDomain(targetProfiles) {
  return targetProfiles.map((targetProfile) => new AttachableTargetProfile(targetProfile));
}
