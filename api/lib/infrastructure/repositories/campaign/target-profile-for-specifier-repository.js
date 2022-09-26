const { knex } = require('../../../../db/knex-database-connection');
const skillDataSource = require('../../datasources/learning-content/skill-datasource');
const TargetProfileForSpecifier = require('../../../domain/read-models/campaign/TargetProfileForSpecifier');
const bluebird = require('bluebird');
const _ = require('lodash');
const { uniqBy } = require('lodash');

async function availableForOrganization(organizationId) {
  const targetProfileRows = await _fetchTargetProfiles(organizationId);

  return bluebird.mapSeries(targetProfileRows, _buildTargetProfileForSpecifier);
}

function _fetchTargetProfiles(organizationId) {
  const selectTargetProfileSharesIdsBelongToOrganization = knex
    .select('targetProfileId')
    .from('target-profile-shares')
    .where({ organizationId });
  return (
    knex('target-profiles')
      .select([
        'target-profiles.id',
        'target-profiles.name',
        'target-profiles.description',
        'target-profiles.category',
        knex.raw('ARRAY_AGG("skillId") AS "skillIds"'),
        knex.raw('ARRAY_AGG("badges"."id")  AS "badgeIds"'),
        knex.raw('ARRAY_AGG("stages"."id")  AS "stageIds"'),
        knex.raw('ARRAY_AGG("target-profile_tubes"."tubeId")  AS "tubeIds"'),
      ])
      // TODO remove it after target profile tube migration to target-profile_tubes
      .leftJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id')
      .leftJoin('target-profile_tubes', 'target-profile_tubes.targetProfileId', 'target-profiles.id')
      .leftJoin('badges', 'badges.targetProfileId', 'target-profiles.id')
      .leftJoin('stages', 'stages.targetProfileId', 'target-profiles.id')
      .where({ outdated: false })
      .where((qb) => {
        qb.orWhere({ isPublic: true });
        qb.orWhere({ ownerOrganizationId: organizationId });
        qb.orWhereIn('target-profiles.id', selectTargetProfileSharesIdsBelongToOrganization);
      })
      .groupBy('target-profiles.id')
  );
}

async function _buildTargetProfileForSpecifier(row) {
  let tubeCount;
  if (row.tubeIds?.[0] != null) {
    tubeCount = row.tubeIds.length;
  } else {
    // TODO remove it after target profile tube migration to target-profile_tubes
    const skills = await skillDataSource.findByRecordIds(row.skillIds);
    tubeCount = uniqBy(skills, 'tubeId').length;
  }
  const thematicResultsIds = _.uniq(row.badgeIds).filter((id) => id);
  const hasStage = row.stageIds.some((stage) => stage);
  return new TargetProfileForSpecifier({
    id: row.id,
    name: row.name,
    tubeCount,
    thematicResults: thematicResultsIds,
    hasStage,
    description: row.description,
    category: row.category,
  });
}

module.exports = {
  availableForOrganization,
};
