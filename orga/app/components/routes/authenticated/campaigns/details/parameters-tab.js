import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class ParametersTab extends Component {

  @service store;
  @service notifications;
  @service url;

  tooltipText = 'Copier le lien direct';

  get campaignsRootUrl() {
    return `${this.url.campaignsRootUrl}${this.campaign.code}`;
  }

  @action
  clipboardSuccess() {
    this.set('tooltipText', 'Copié !');
  }

  @action
  clipboardOut() {
    this.set('tooltipText', 'Copier le lien direct');
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
