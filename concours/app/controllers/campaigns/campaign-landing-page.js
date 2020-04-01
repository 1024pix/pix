import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['participantExternalId'],
  participantExternalId: null,
  isLoading: false,
  pageTitle: 'Présentation',

  actions: {
    startCampaignParticipation() {
      this.set('isLoading', true);
      return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { hasSeenLanding: true, participantExternalId: this.participantExternalId }
      });
    }
  }
});
