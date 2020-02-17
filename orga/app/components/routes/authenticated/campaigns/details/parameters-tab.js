import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  notifications: service(),
  tooltipText: 'Copier le lien direct',

  actions: {
    clipboardSuccess() {
      this.set('tooltipText', 'Copié !');
    },

    clipboardOut() {
      this.set('tooltipText', 'Copier le lien direct');
    },
    async archiveCampaign(campaignId) {
      try {
        const campaign = this.store.peekRecord('campaign', campaignId);
        await campaign.archive();
      } catch (err) {
        this.notifications.error('Une erreur est survenue');
      }
    }
  }
});
