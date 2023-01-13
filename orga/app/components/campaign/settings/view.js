import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CampaignView extends Component {
  @service store;
  @service notifications;
  @service url;
  @service intl;
  @service currentUser;

  get displayCampaignActionsButtons() {
    const campaignIsNotArchived = !this.args.campaign.isArchived;

    const isCurrentUserAdmin = this.currentUser.prescriber.isAdminOfTheCurrentOrganization;
    const isCurrentUserOwnerOfTheCampaign = parseInt(this.currentUser.prescriber.id) === this.args.campaign.ownerId;
    const isCurrentUserAllowedToUpdateCampaign = isCurrentUserAdmin || isCurrentUserOwnerOfTheCampaign;

    return campaignIsNotArchived && isCurrentUserAllowedToUpdateCampaign;
  }

  get displayCampaignsRootUrl() {
    return !this.currentUser.prescriber.hasCurrentOrganizationWithGARAsIdentityProvider;
  }

  get campaignsRootUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaign.code}`;
  }

  get campaignType() {
    return this.args.campaign.isTypeAssessment
      ? this.intl.t('pages.campaign-settings.campaign-type.assessment')
      : this.intl.t('pages.campaign-settings.campaign-type.profiles-collection');
  }

  get multipleSendingsText() {
    return this.args.campaign.multipleSendings
      ? this.intl.t('pages.campaign-settings.multiple-sendings.status.enabled')
      : this.intl.t('pages.campaign-settings.multiple-sendings.status.disabled');
  }

  get multipleSendingsTooltipText() {
    return this.args.campaign.multipleSendings
      ? this.intl.t('pages.campaign-settings.multiple-sendings.tooltip.text-multiple-sendings-enabled')
      : this.intl.t('pages.campaign-settings.multiple-sendings.tooltip.text-multiple-sendings-disabled');
  }

  @action
  async archiveCampaign(campaignId) {
    try {
      const campaign = this.store.peekRecord('campaign', campaignId);
      await campaign.archive();
    } catch (err) {
      this.notifications.error(this.intl.t('api-error-messages.global'));
    }
  }
}
