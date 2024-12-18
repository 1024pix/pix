import { CampaignParticipationStatuses, CampaignTypes } from '../../src/prescription/shared/domain/constants.js';

const up = async function (knex) {
  return await knex('knowledge-element-snapshots')
    .update({
      campaignParticipationId: knex('campaign-participations')
        .select('campaign-participations.id')
        .join('campaigns', function () {
          this.on({ 'campaigns.id': 'campaignId' }).andOnIn('campaigns.type', [CampaignTypes.ASSESSMENT]);
        })
        .where('snappedAt', '=', knex.raw('??', 'sharedAt'))
        .where('knowledge-element-snapshots.userId', knex.raw('??', 'campaign-participations.userId'))
        .whereNotNull('sharedAt')
        .whereNotNull('userId')
        .where({ status: CampaignParticipationStatuses.SHARED }),
    })
    .whereNull('campaignParticipationId');
};

const down = async () => {
  return;
};

export { down, up };
