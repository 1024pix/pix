import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { TargetProfileForSpecifier } from '../../domain/read-models/TargetProfileForSpecifier.js';

async function availableForOrganization(organizationId) {
  const targetProfileRows = await _fetchTargetProfiles(organizationId);

  return PromiseUtils.mapSeries(targetProfileRows, _buildTargetProfileForSpecifier);
}

function _fetchTargetProfiles(organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const selectTargetProfileSharesIdsBelongToOrganization = knexConn
    .select('targetProfileId')
    .from('target-profile-shares')
    .where({ organizationId });
  return knexConn('target-profiles')
    .select([
      'target-profiles.id',
      'target-profiles.name',
      'target-profiles.description',
      'target-profiles.category',
      'target-profiles.areKnowledgeElementsResettable',
      'target-profiles.isSimplifiedAccess',
      knexConn.count('id').from('badges').whereRaw('badges."targetProfileId"="target-profiles".id').as('countBadges'),
      knexConn.count('id').from('stages').whereRaw('stages."targetProfileId"="target-profiles".id').as('countStages'),
      knexConn
        .count('tubeId')
        .from('target-profile_tubes')
        .whereRaw('"target-profile_tubes"."targetProfileId"="target-profiles".id')
        .as('countTubes'),
    ])
    .where({ outdated: false })
    .whereIn('target-profiles.id', selectTargetProfileSharesIdsBelongToOrganization)
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
    isSimplifiedAccess: row.isSimplifiedAccess,
  });
}

export { availableForOrganization };
