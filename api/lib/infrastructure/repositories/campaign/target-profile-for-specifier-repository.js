import { knex } from '../../../../db/knex-database-connection';
import skillDataSource from '../../datasources/learning-content/skill-datasource';
import TargetProfileForSpecifier from '../../../domain/read-models/campaign/TargetProfileForSpecifier';
import bluebird from 'bluebird';
import { uniqBy } from 'lodash';

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
      // TODO remove it after target profile tube migration to target-profile_tubes
      knex
        .select(knex.raw('ARRAY_AGG("skillId")'))
        .from('target-profiles_skills')
        .whereRaw('"target-profiles_skills"."targetProfileId"="target-profiles".id')
        .as('skillIds'),
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
  let tubeCount;
  if (row.countTubes > 0) {
    tubeCount = row.countTubes;
  } else {
    // TODO remove it after target profile tube migration to target-profile_tubes
    const skills = await skillDataSource.findByRecordIds(row.skillIds);
    tubeCount = uniqBy(skills, 'tubeId').length;
  }
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
  });
}

export default {
  availableForOrganization,
};
