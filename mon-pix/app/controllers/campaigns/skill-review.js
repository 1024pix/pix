import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import Controller from '@ember/controller';
import _ from 'lodash';

@classic
export default class SkillReviewController extends Controller {
  displayLoadingButton = false;
  displayErrorMessage = false;
  displayImprovementButton = false;
  pageTitle = 'Résultat';

  @computed(
    'model.{campaignParticipation.campaignParticipationResult.badge,campaignParticipation.campaignParticipationResult.areBadgeCriteriaFulfilled}'
  )
  get shouldShowBadge() {
    const badge = this.get('model.campaignParticipation.campaignParticipationResult.badge.content');
    const areBadgeCriteriaFulfilled = this.get('model.campaignParticipation.campaignParticipationResult.areBadgeCriteriaFulfilled');
    return (!_.isEmpty(badge) && areBadgeCriteriaFulfilled);
  }

  @action
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
  }

  @action
  async improvementCampaignParticipation() {
    const assessment = this.get('model.assessment');
    const campaignParticipation = this.get('model.campaignParticipation');
    await campaignParticipation.save({ adapterOptions: { beginImprovement: true } });
    return this.transitionToRoute('campaigns.start-or-resume', assessment.get('codeCampaign'));
  }
}
