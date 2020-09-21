import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Tab extends Component {

  @service store;
  @service notifications;
  @service url;

  @tracked tooltipText = 'Copier le lien direct';

  get campaignsRootUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaign.code}`;
  }

  @action
  clipboardSuccess() {
    this.tooltipText = 'Copié !';
  }

  @action
  clipboardOut() {
    this.tooltipText = 'Copier le lien direct';
  }

  @action
  async archiveCampaign(campaignId) {
    try {
      const campaign = this.store.peekRecord('campaign', campaignId);
      await campaign.archive();
    } catch (err) {
      this.notifications.error('Une erreur est survenue');
    }
  }
}
