import Controller from '@ember/controller';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Controller.extend({

  displayLoadingButton: false,
  displayErrorMessage: false,
  displayImprovementButton: false,
  pageTitle: 'Résultat',

  shouldShowBadge: computed('model.{campaignParticipation.campaignParticipationResult.badge,campaignParticipation.campaignParticipationResult.areBadgeCriteriaValidated}', function() {
    const badge = this.get('model.campaignParticipation.campaignParticipationResult.badge.content');
    const areBadgeCriteriaValidated = this.get('model.campaignParticipation.campaignParticipationResult.areBadgeCriteriaValidated');
    return (!_.isEmpty(badge) && areBadgeCriteriaValidated);
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
