import _maxBy from 'lodash/maxBy';
import { computed } from '@ember/object';
import { filterBy } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['resume-campaign-banner'],
  campaignParticipations: [],

  unsharedCampaignParticipations: filterBy('campaignParticipations', 'isShared', false),

  lastUnsharedCampaignParticipation: computed('unsharedCampaignParticipations.@each.createdAt', function() {
    return _maxBy(this.unsharedCampaignParticipations, 'createdAt');
  }),

  campaignToResumeOrShare: computed('lastUnsharedCampaignParticipation.campaign.{title,code},lastUnsharedCampaignParticipation.assessment.isCompleted', function() {
    if (this.lastUnsharedCampaignParticipation) {
      return {
        title: this.lastUnsharedCampaignParticipation.campaign.get('title'),
        code: this.lastUnsharedCampaignParticipation.campaign.get('code'),
        assessment: this.lastUnsharedCampaignParticipation.assessment
      };
    }

    return null;
  }),

});
