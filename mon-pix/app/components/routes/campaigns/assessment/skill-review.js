import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import Component from '@glimmer/component';

export default class SkillReview extends Component {

  @service router
  @service session;
  @service url

  @tracked displayErrorMessage = false;

  get showCleaCompetences() {
    const cleaBadge = this.args.model.campaignParticipation.campaignParticipationResult.get('cleaBadge');
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
    const badges = this.args.model.campaignParticipation.campaignParticipationResult.get('campaignParticipationBadges');
    return badges.filter((badge) => badge.isAcquired);
  }

  get showStages() {
    return this.stageCount && !this._isCleaBadgeAcquired;
  }

  get reachedStage() {
    return this.args.model.campaignParticipation.campaignParticipationResult.get('reachedStage');
  }

  get stageCount() {
    return this.args.model.campaignParticipation.campaignParticipationResult.get('stageCount');
  }

  @action
  shareCampaignParticipation() {
    this.displayErrorMessage = false;
    this.displayLoadingButton = true;
    const campaignParticipation = this.args.model.campaignParticipation;
    return campaignParticipation.save()
      .then(async () => {
        campaignParticipation.isShared = true;

        const isSimplifiedAccessCampaign = await this.args.model.campaignParticipation.campaign.get('isSimplifiedAccess');
        if (isSimplifiedAccessCampaign) {
          return this.disconnectUser();
        }
      })
      .catch(() => {
        campaignParticipation.rollbackAttributes();
        this.displayErrorMessage = true;
      });
  }

  @action
  async improvementCampaignParticipation() {
    const assessment = this.args.model.assessment;
    const campaignParticipation = this.args.model.campaignParticipation;
    await campaignParticipation.save({ adapterOptions: { beginImprovement: true } });
    return this.router.transitionTo('campaigns.start-or-resume', assessment.codeCampaign);
  }

  async disconnectUser() {
    await this.session.invalidate();
    return window.location.replace(this.url.homeUrl);
  }

}
