import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class SkillReviewController extends Controller {
  @tracked displayLoadingButton = false;
  @tracked displayErrorMessage = false;
  @tracked displayImprovementButton = false;
  pageTitle = 'Résultat';

  get showCleaCompetences() {
    const partnerCompetenceResults = this.model.campaignParticipation.campaignParticipationResult.get('partnerCompetenceResults');
    return partnerCompetenceResults.length > 0;
  }

  @action
  shareCampaignParticipation() {
    this.displayErrorMessage = false;
    this.displayLoadingButton = true;
    const campaignParticipation = this.model.campaignParticipation;
    campaignParticipation.isShared = true;
    return campaignParticipation.save()
      .then(() => {
        this.displayLoadingButton = false;
      })
      .catch(() => {
        campaignParticipation.rollbackAttributes();
        this.displayLoadingButton = false;
        this.displayErrorMessage = true;
      });
  }

  @action
  async improvementCampaignParticipation() {
    const assessment = this.model.assessment;
    const campaignParticipation = this.model.campaignParticipation;
    await campaignParticipation.save({ adapterOptions: { beginImprovement: true } });
    return this.transitionToRoute('campaigns.start-or-resume', assessment.codeCampaign);
  }
}
