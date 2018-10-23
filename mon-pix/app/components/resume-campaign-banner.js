import _orderBy from 'lodash/orderBy';
import _filter from 'lodash/filter';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['resume-campaign-banner'],
  campaignParticipations: [],

  campaignToResume: computed('campaignParticipations', function() {
    const campaignParticipations = this.get('campaignParticipations').toArray();

    const campaignParticipationsNotShared = _filter(campaignParticipations,
      (campaignParticipation) => campaignParticipation.isShared === false);

    const campaignParticipationOrdered = _orderBy(campaignParticipationsNotShared, 'createdAt', 'desc');

    return campaignParticipationOrdered[0];
  }),

  canResumeCampaign: computed('campaignParticipations', function() {
    return this.get('campaignToResume');
  }),

});
