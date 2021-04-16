import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import isNil from 'lodash/isNil';

import Component from '@glimmer/component';

export default class SkillReview extends Component {

  @service intl
  @service router
  @service session;
  @service currentUser;
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

  get isShared() {
    return this.args.model.campaignParticipation.get('isShared');
  }

  get displayPixLink() {
    return !this.showOrganizationButton;
  }

  get displayOrganizationCustomMessage() {
    return Boolean((this.showOrganizationMessage || this.showOrganizationButton) && this.isShared);
  }

  get showOrganizationMessage() {
    return Boolean(this.organizationMessage);
  }

  get organizationMessage() {
    return this.args.model.campaignParticipation.campaign.get('customResultPageText');
  }

  get organizationLogoUrl() {
    return this.args.model.campaignParticipation.campaign.get('organizationLogoUrl');
  }

  get organizationName() {
    return this.args.model.campaignParticipation.campaign.get('organizationName');
  }

  get showOrganizationButton() {
    return Boolean(this.customButtonText && this.customButtonUrl);
  }

  get masteryPercentage() {
    return this.args.model.campaignParticipation.campaignParticipationResult.get('masteryPercentage');
  }

  get participantExternalId() {
    return this.args.model.campaignParticipation.get('participantExternalId');
  }

  get customButtonUrl() {
    const buttonUrl = this.args.model.campaignParticipation.campaign.get('customResultPageButtonUrl');
    if (buttonUrl) {
      const params = {};

      if (!isNil(this.masteryPercentage)) {
        params.masteryPercentage = this.masteryPercentage;
      }

      if (!isNil(this.participantExternalId)) {
        params.externalId = this.participantExternalId;
      }

      if (!isNil(this.reachedStage)) {
        params.stage = this.reachedStage.get('threshold');
      }

      return this._buildUrl(buttonUrl, params);
    } else {
      return null;
    }
  }

  get customButtonText() {
    return this.args.model.campaignParticipation.campaign.get('customResultPageButtonText');
  }

  _buildUrl(baseUrl, params) {
    const Url = new URL(baseUrl);
    const urlParams = new URLSearchParams(Url.search);
    for (const key in params) {
      if (params[key] !== undefined) {
        urlParams.set(key, params[key]);
      }
    }
    Url.search = urlParams.toString();
    return Url.toString();
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

  @action
  async redirectForNoviceCampaign() {
    if (this.currentUser.user.isAnonymous) {
      await this.session.invalidate();
      this.router.transitionTo('inscription');
    } else {
      this.router.transitionTo('index');
    }
  }
}
