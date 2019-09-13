import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['participantExternalId'],
  participantExternalId: null,

  actions: {
    startCampaignParticipation() {
      return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { hasSeenLanding: true, participantExternalId: this.get('participantExternalId') }
      });
    }
  }
});
