import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  isShared: attr('boolean'),
  participantExternalId: attr('string'),
  createdAt: attr('date'),
  sharedAt: attr('date'),
  campaign: belongsTo('campaign'),
  user: belongsTo('user'),
  campaignParticipationResult: belongsTo('campaignParticipationResult'),

  isCampaignParticipationResultShared: computed('isShared', 'campaignParticipationResult', 'campaignParticipationResult.competenceResults.[]', function () {
    return this.isShared && this.campaignParticipationResult && this.campaignParticipationResult.get('competenceResults.length');
  }),

});
