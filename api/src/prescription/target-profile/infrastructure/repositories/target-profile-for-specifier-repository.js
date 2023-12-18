import { knex } from '../../../../../db/knex-database-connection.js';
import { TargetProfileForSpecifier } from '../../domain/read-models/TargetProfileForSpecifier.js';
import bluebird from 'bluebird';

async function availableForOrganization(organizationId) {
  const targetProfileRows = await _fetchTargetProfiles(organizationId);

  return bluebird.mapSeries(targetProfileRows, _buildTargetProfileForSpecifier);
}

function _fetchTargetProfiles(organizationId) {
  const selectTargetProfileSharesIdsBelongToOrganization = knex
    .select('targetProfileId')
    .from('target-profile-shares')
    .where({ organizationId });
  return knex('target-profiles')
    .select([
      'target-profiles.id',
      'target-profiles.name',
      'target-profiles.description',
      'target-profiles.category',
      'target-profiles.areKnowledgeElementsResettable',
      'target-profiles.isSimplifiedAccess',
      'target-profiles.isPublic',
      knex.count('id').from('badges').whereRaw('badges."targetProfileId"="target-profiles".id').as('countBadges'),
      knex.count('id').from('stages').whereRaw('stages."targetProfileId"="target-profiles".id').as('countStages'),
      knex
        .count('tubeId')
        .from('target-profile_tubes')
        .whereRaw('"target-profile_tubes"."targetProfileId"="target-profiles".id')
        .as('countTubes'),
    ])
    .where({ outdated: false })
    .where((qb) => {
      qb.orWhere({ isPublic: true });
      qb.orWhere({ ownerOrganizationId: organizationId });
      qb.orWhereIn('target-profiles.id', selectTargetProfileSharesIdsBelongToOrganization);
    })
    .groupBy('target-profiles.id');
}

async function _buildTargetProfileForSpecifier(row) {
  const tubeCount = row.countTubes;
  const thematicResultCount = row.countBadges;
  const hasStage = row.countStages > 0;
  return new TargetProfileForSpecifier({
    id: row.id,
    name: row.name,
    tubeCount,
    thematicResultCount,
    hasStage,
    description: row.description,
    category: row.category,
    areKnowledgeElementsResettable: row.areKnowledgeElementsResettable,
    isPublic: row.isPublic,
    isSimplifiedAccess: row.isSimplifiedAccess,
  });
}

export { availableForOrganization };
