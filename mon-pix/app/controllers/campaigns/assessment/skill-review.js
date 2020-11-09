import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import ENV from 'mon-pix/config/environment';

export default class SkillReviewController extends Controller {
  @tracked displayLoadingButton = false;
  @tracked displayErrorMessage = false;
  @tracked displayImprovementButton = false;

  get showCleaCompetences() {
    const cleaBadge = this.model.campaignParticipation.campaignParticipationResult.get('cleaBadge');
    return !!cleaBadge;
  }

  get _isCleaBadgeAcquired() {
    const pixEmploiClea = 'PIX_EMPLOI_CLEA';
    return this.acquiredBadges.some((badge) => badge.key === pixEmploiClea);
  }

  get hideBadgesTitle() {
    return this._isCleaBadgeAcquired && this.acquiredBadges.length === 1;
  }

  get showBadges() {
    return this.acquiredBadges.length > 0;
  }

  get acquiredBadges() {
    const badges = this.model.campaignParticipation.campaignParticipationResult.get('campaignParticipationBadges');
    return badges.filter((badge) => badge.isAcquired);
  }

  get showStages() {
    return this.stageCount && !this._isCleaBadgeAcquired;
  }

  get reachedStage() {
    return this.model.campaignParticipation.campaignParticipationResult.get('reachedStage');
  }

  get stageCount() {
    return this.model.campaignParticipation.campaignParticipationResult.get('stageCount');
  }

  get isPixContest() {
    return ENV.APP.IS_PIX_CONTEST === 'true';
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
