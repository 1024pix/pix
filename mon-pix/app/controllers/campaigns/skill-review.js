import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  displayLoadingButton: false,
  displayErrorMessage: false,
  displayImprovementButton: false,
  pageTitle: 'Résultat',

  shouldShowPixEmploiBadge: computed('model.{campaignParticipation.campaign.targetProfile.name,campaignParticipation.campaignParticipationResult.masteryPercentage}', function() {
    const targetProfileName = this.get('model.campaignParticipation.campaign.targetProfile.name');
    const masteryPercentage = this.get('model.campaignParticipation.campaignParticipationResult.masteryPercentage');
    return (masteryPercentage >= 85 && targetProfileName === 'Pix emploi - Parcours complet');
  }),

  shouldShowCleaNumeriqueBadge: computed('model.{campaignParticipation.campaign.targetProfile.name,campaignParticipation.campaignParticipationResult.masteryPercentage}', function() {
    const targetProfileName = this.get('model.campaignParticipation.campaign.targetProfile.name');
    const masteryPercentage = this.get('model.campaignParticipation.campaignParticipationResult.masteryPercentage');
    return (masteryPercentage >= 85 && targetProfileName === 'Parcours Cléa numérique');
  }),

  actions: {
    shareCampaignParticipation() {
      this.set('displayErrorMessage', false);
      this.set('displayLoadingButton', true);
      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);
      return campaignParticipation.save()
        .then(() => {
          this.set('displayLoadingButton', false);
        })
        .catch(() => {
          campaignParticipation.rollbackAttributes();
          this.set('displayLoadingButton', false);
          this.set('displayErrorMessage', true);
        });
    },

    async improvementCampaignParticipation() {
      const assessment = this.get('model.assessment');
      const campaignParticipation = this.get('model.campaignParticipation');
      await campaignParticipation.save({ adapterOptions: { beginImprovement: true } });
      return this.transitionToRoute('campaigns.start-or-resume', assessment.get('codeCampaign'));
    },

  }
});
