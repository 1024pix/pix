import _orderBy from 'lodash/orderBy';
import _filter from 'lodash/filter';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['resume-campaign-banner'],
  campaignParticipations: [],

  campaignToResumeOrShare: computed('campaignParticipations', function() {
    const campaignParticipations = this.get('campaignParticipations').toArray();

    const campaignParticipationsNotShared = _filter(campaignParticipations,
      (campaignParticipation) => campaignParticipation.isShared === false);

    const campaignParticipationOrdered = _orderBy(campaignParticipationsNotShared, 'createdAt', 'desc');

    const lastCampaignParticipationStarted = campaignParticipationOrdered[0];

    if(lastCampaignParticipationStarted) {
      return {
        title: lastCampaignParticipationStarted.campaign.get('title'),
        code: lastCampaignParticipationStarted.campaign.get('code'),
        assessment: lastCampaignParticipationStarted.assessment
      };
    }

    return null;
  }),

});
