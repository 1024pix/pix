import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import isNil from 'lodash/isNil';

import Component from '@glimmer/component';

export default class SkillReview extends Component {
  @service intl;
  @service router;
  @service session;
  @service currentUser;
  @service url;
  @service store;

  @tracked showNotFinishedYetMessage = false;
  @tracked showGlobalErrorMessage = false;
  @tracked isShareButtonClicked = false;

  get showCleaCompetences() {
    const cleaBadge = this.args.model.campaignParticipationResult.cleaBadge;
    return !!cleaBadge;
  }

  get _isCleaBadgeAcquired() {
    const pixEmploiClea = 'PIX_EMPLOI_CLEA';
    return this.acquiredBadges.some((badge) => badge.key === pixEmploiClea);
  }

  get hideBadgesTitle() {
    return this._isCleaBadgeAcquired && this.acquiredBadges.length === 1;
  }

  get showDisabledBlock() {
    return this.args.model.campaignParticipationResult.isDisabled && !this.isShared;
  }

  get showBadges() {
    return this.orderedBadges.length > 0;
  }

  get acquiredBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;
    return badges.filter((badge) => badge.isAcquired);
  }

  get notAcquiredButVisibleBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;
    return badges.filter((badge) => !badge.isAcquired && badge.isAlwaysVisible);
  }

  get orderedBadges() {
    return [...this.acquiredBadges, ...this.notAcquiredButVisibleBadges];
  }

  get showStages() {
    return this.stageCount && !this._isCleaBadgeAcquired;
  }

  get reachedStage() {
    return this.args.model.campaignParticipationResult.reachedStage;
  }

  get stageCount() {
    return this.args.model.campaignParticipationResult.stageCount;
  }

  get isShared() {
    return this.args.model.campaignParticipationResult.isShared;
  }

  get displayPixLink() {
    return !this.showOrganizationButton;
  }

  get displayOrganizationCustomMessage() {
    return Boolean((this.showOrganizationMessage || this.showOrganizationButton) && this.isShared);
  }

  get showOrganizationMessage() {
    return Boolean(this.args.model.campaign.customResultPageText);
  }

  get showOrganizationButton() {
    return Boolean(this.customButtonText && this.customButtonUrl);
  }

  get isFlashCampaign() {
    return this.args.model.campaign.isFlash;
  }

  get showDetail() {
    return !this.isFlashCampaign;
  }

  get masteryRate() {
    return this.args.model.campaignParticipationResult.masteryRate;
  }

  get masteryPercentage() {
    if (this.args.model.campaignParticipationResult.masteryRate >= 0) {
      return this.args.model.campaignParticipationResult.masteryRate * 100;
    }
    return null;
  }

  get estimatedFlashLevel() {
    return this.args.model.campaignParticipationResult.estimatedFlashLevel;
  }

  get flashPixCount() {
    return ((this.estimatedFlashLevel + 10) / 20) * 1024;
  }

  get participantExternalId() {
    return this.args.model.campaignParticipationResult.participantExternalId;
  }

  get customButtonUrl() {
    const buttonUrl = this.args.model.campaign.customResultPageButtonUrl;
    if (buttonUrl) {
      const params = {};

      if (!isNil(this.masteryRate)) {
        params.masteryPercentage = parseInt(this.masteryRate * 100);
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
    return this.args.model.campaign.customResultPageButtonText;
  }

  get showNPS() {
    return this.args.model.campaign.organizationShowNPS && this.isShared;
  }

  get showImproveButton() {
    return this.args.model.campaignParticipationResult.canImprove && !this.isShareButtonClicked;
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
  async shareCampaignParticipation() {
    this.showNotFinishedYetMessage = false;
    this.showGlobalErrorMessage = false;
    this.isShareButtonClicked = true;
    const campaignParticipationResult = this.args.model.campaignParticipationResult;

    const adapter = this.store.adapterFor('campaign-participation-result');
    try {
      await adapter.share(campaignParticipationResult.id);
    } catch (errorResponse) {
      if (!errorResponse?.errors) {
        this.showGlobalErrorMessage = true;
        throw errorResponse;
      }
      errorResponse.errors.forEach((error) => {
        if (error.status === '409') {
          this.showNotFinishedYetMessage = true;
        } else {
          this.isShareButtonClicked = false;
          this.showGlobalErrorMessage = true;
          throw error;
        }
      });
    }

    campaignParticipationResult.isShared = true;
  }

  @action
  async improve() {
    const campaignParticipationResult = this.args.model.campaignParticipationResult;
    const adapter = this.store.adapterFor('campaign-participation-result');
    await adapter.beginImprovement(campaignParticipationResult.id);
    return this.router.transitionTo('campaigns.entry-point', this.args.model.campaign.code);
  }

  @action
  async redirectToSignupIfUserIsAnonymous(event) {
    event.preventDefault();
    if (this.currentUser.user.isAnonymous) {
      await this.session.invalidate();
      this.router.transitionTo('inscription');
    } else {
      this.router.transitionTo('index');
    }
  }
}
