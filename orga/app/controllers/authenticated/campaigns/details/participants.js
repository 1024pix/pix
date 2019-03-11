import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize'],
  pageNumber: 1,
  pageSize: 10,

  actions: {
    goToParticipantPage:function(campaignId, participantId) {
      this.transitionToRoute('authenticated.campaigns.details.participants.results', campaignId, participantId);
    }
  }
});
