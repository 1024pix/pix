const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';
const CAMPAIGN_PARTICIPATION_ID_COLUMN = 'campaignParticipationId';

exports.up = async function (knex) {
  const badgeAcquisitionsToResolve = await knex(BADGE_ACQUISITIONS_TABLE)
    .select('id', 'userId', 'badgeId', 'createdAt')
    .whereNull(CAMPAIGN_PARTICIPATION_ID_COLUMN);
  let allDone = true;
  for (const badgeAcquisition of badgeAcquisitionsToResolve) {
    const targetProfileId = await _findTargetProfileIdFromBadgeId(badgeAcquisition.badgeId, knex);
    const eligibleParticipations = await _findParticipations({
      userId: badgeAcquisition.userId,
      targetProfileId,
      knex,
    });
    if (eligibleParticipations.length) {
      const participation = _findParticipationClosestToTimestamp(eligibleParticipations, badgeAcquisition.createdAt);
      await _updateBadgeAcquisitionWithParticipation(badgeAcquisition.id, participation.id, knex);
    } else {
      allDone = false;
    }
  }
  if (allDone) {
    await knex.schema.alterTable(BADGE_ACQUISITIONS_TABLE, (table) => {
      table.integer(CAMPAIGN_PARTICIPATION_ID_COLUMN).notNullable().alter();
    });
  }
};

exports.down = function (knex) {
  return knex.schema.alterTable(BADGE_ACQUISITIONS_TABLE, (table) => {
    table.integer(CAMPAIGN_PARTICIPATION_ID_COLUMN).nullable().alter();
  });
};

async function _findTargetProfileIdFromBadgeId(badgeId, knex) {
  return (await knex('badges').pluck('targetProfileId').where('id', badgeId))[0];
}

async function _findParticipations({ userId, targetProfileId, knex }) {
  return knex('campaign-participations')
    .select({
      id: 'campaign-participations.id',
      completedAt: 'assessments.updatedAt',
    })
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .where('campaign-participations.userId', userId)
    .where('campaigns.targetProfileId', targetProfileId)
    .where('assessments.state', 'completed');
}

function _findParticipationClosestToTimestamp(participations, timestamp) {
  // sorting participations by date distance
  const sortByClosestDateFromTimestamp = function (participationA, participationB) {
    const distance_a = Math.abs(timestamp - participationA.completedAt);
    const distance_b = Math.abs(timestamp - participationB.completedAt);
    return distance_a - distance_b;
  };
  participations.sort(sortByClosestDateFromTimestamp);
  return participations[0];
}

async function _updateBadgeAcquisitionWithParticipation(badgeAcquisitionId, campaignParticipationId, knex) {
  await knex(BADGE_ACQUISITIONS_TABLE).update({ campaignParticipationId }).where('id', badgeAcquisitionId);
}
