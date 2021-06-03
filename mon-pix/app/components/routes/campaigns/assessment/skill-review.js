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

  @tracked displayErrorMessage = false;

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

  get showBadges() {
    return this.acquiredBadges.length > 0;
  }

  get acquiredBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;
    return badges.filter((badge) => badge.isAcquired);
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

  get masteryPercentage() {
    return this.args.model.campaignParticipationResult.masteryPercentage;
  }

  get participantExternalId() {
    return this.args.model.campaignParticipationResult.participantExternalId;
  }

  get customButtonUrl() {
    const buttonUrl = this.args.model.campaign.customResultPageButtonUrl;
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
    return this.args.model.campaign.customResultPageButtonText;
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
    this.displayErrorMessage = false;
    const campaignParticipationResult = this.args.model.campaignParticipationResult;

    const adapter = this.store.adapterFor('campaign-participation-result');
    try {
      await adapter.share(campaignParticipationResult.id);
    } catch (err) {
      this.displayErrorMessage = true;
      return;
    }

    campaignParticipationResult.isShared = true;
    const isSimplifiedAccessCampaign = this.args.model.campaign.isSimplifiedAccess;
    if (isSimplifiedAccessCampaign) {
      return this.disconnectUser();
    }
  }

  @action
  async improve() {
    const campaignParticipationResult = this.args.model.campaignParticipationResult;
    const adapter = this.store.adapterFor('campaign-participation-result');
    await adapter.beginImprovement(campaignParticipationResult.id);
    return this.router.transitionTo('campaigns.start-or-resume', this.args.model.campaign.code);
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
