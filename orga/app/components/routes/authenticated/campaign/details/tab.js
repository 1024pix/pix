import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Tab extends Component {

  @service store;
  @service notifications;
  @service url;
  @service intl;

  @tracked tooltipText = this.intl.t('pages.campaign-details.actions.copy-link.copy');

  get campaignsRootUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaign.code}`;
  }

  @action
  clipboardSuccess() {
    this.tooltipText = this.intl.t('pages.campaign-details.actions.copy-link.copied');
  }

  @action
  clipboardOut() {
    this.tooltipText = this.intl.t('pages.campaign-details.actions.copy-link.copy');
  }

  @action
  async archiveCampaign(campaignId) {
    try {
      const campaign = this.store.peekRecord('campaign', campaignId);
      await campaign.archive();
    } catch (err) {
      this.notifications.error(this.intl.t('api-error-messages.global-error'));
    }
  }
}
