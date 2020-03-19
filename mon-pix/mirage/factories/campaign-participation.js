import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({

  isShared() {
    return false;
  },

  completedWithResults: trait({
    afterCreate(campaignParticipation, server) {
      campaignParticipation.assessment.update({ state: 'completed' });
      const campaignParticipationResult = server.schema.campaignParticipationResults.create();
      campaignParticipation.update({ campaignParticipationResult });
    }
  }),

  afterCreate(campaignParticipation, server) {
    if (!campaignParticipation.assessment) {
      campaignParticipation.update({
        assessment: server.create('assessment', 'ofSmartPlacementType', {
          state: 'started',
          codeCampaign: campaignParticipation.campaign.code,
          title: campaignParticipation.campaign.title,
        }),
      }); 
    }
  },
});
