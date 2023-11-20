import { service } from '@ember/service';
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
  @tracked displayResetCampaignParticipationModal = false;

  get retryQuery() {
    return {
      retry: true,
    };
  }

  get resetQuery() {
    return {
      reset: true,
    };
  }

  get displayRetryOrResetActions() {
    return this.args.model.campaignParticipationResult.canRetry || this.args.model.campaignParticipationResult.canReset;
  }

  get title() {
    return this.args.model.campaign.title || this.intl.t('pages.skill-review.title');
  }

  get showDisabledBlock() {
    return this.args.model.campaignParticipationResult.isDisabled && !this.isShared;
  }

  get showNotCertifiableBadges() {
    return this.notCertifiableBadges.length > 0;
  }

  get showCertifiableBadges() {
    return this.certifiableBadgesOrderedByValidity.length > 0;
  }

  get notCertifiableBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;
    return badges.filter((badge) => (badge.isAcquired || badge.isAlwaysVisible) && !badge.isCertifiable);
  }

  get certifiableBadgesOrderedByValidity() {
    return [...this.validBadges, ...this.invalidBadges];
  }

  get showValidBadges() {
    return this.validBadges.length > 0;
  }

  get validBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;
    return badges.filter((badge) => badge.isAcquired && badge.isCertifiable && badge.isValid);
  }

  get invalidBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;
    return badges.filter(
      (badge) =>
        (badge.isCertifiable && badge.isAcquired && !badge.isValid) ||
        (badge.isCertifiable && !badge.isAcquired && badge.isAlwaysVisible),
    );
  }

  get showStages() {
    return this.args.model.campaignParticipationResult.hasReachedStage;
  }

  get showStagesWithStars() {
    return this.args.model.campaignParticipationResult.hasReachedStage;
  }

  get reachedStage() {
    return this.args.model.campaignParticipationResult.reachedStage;
  }

  get isShared() {
    return this.args.model.campaignParticipationResult.isShared;
  }

  get displayPixLink() {
    return !this.showOrganizationButton;
  }

  get displayOrganizationCustomMessage() {
    const hasCustomBlock = this.showOrganizationMessage || this.showOrganizationButton;
    const showCustomBlock = this.isShared || this.args.model.campaign.isForAbsoluteNovice;

    return hasCustomBlock && showCustomBlock;
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

  get flashPixScore() {
    return this.args.model.campaignParticipationResult.flashPixScore;
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

  get competenceResultsGroupedByAreas() {
    const competenceResults = this.args.model.campaignParticipationResult.get('competenceResults').toArray();
    return competenceResults.reduce((acc, competenceResult) => {
      const currentArea = competenceResult.areaTitle;
      const competence = {
        name: competenceResult.name,
        masteryRate: competenceResult.masteryRate,
        acquiredStagesCount: competenceResult.acquiredStagesCount,
      };
      if (acc[currentArea]) {
        acc[currentArea].competences.push(competence);
      } else {
        acc[currentArea] = {
          areaTitle: currentArea,
          areaColor: competenceResult.areaColor,
          competences: [competence],
        };
      }
      return acc;
    }, {});
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
  showResetModal() {
    this.displayResetCampaignParticipationModal = true;
  }

  @action
  closeResetModal() {
    this.displayResetCampaignParticipationModal = false;
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
        return;
      }
      errorResponse.errors.forEach((error) => {
        if (error.status === '409') {
          this.showNotFinishedYetMessage = true;
        } else {
          this.isShareButtonClicked = false;
          this.showGlobalErrorMessage = true;
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
    this.router.transitionTo('campaigns.entry-point', this.args.model.campaign.code);
    return;
  }

  @action
  async redirectToSignupIfUserIsAnonymous(event) {
    event.preventDefault();
    if (this.currentUser.user.isAnonymous) {
      await this.session.invalidate();
      this.router.transitionTo('inscription');
    } else {
      this.router.transitionTo('authenticated');
    }
  }
}
