import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  notifications: service(),

  participationsCount: computed('campaign.campaignReport.participationsCount', function() {
    const participationsCount = this.get('campaign.campaignReport.participationsCount');

    return participationsCount > 0 ? participationsCount : '-';
  }),

  sharedParticipationsCount: computed('campaign.campaignReport.sharedParticipationsCount', function() {
    const sharedParticipationsCount = this.get('campaign.campaignReport.sharedParticipationsCount');

    return sharedParticipationsCount > 0 ? sharedParticipationsCount : '-';
  }),
  actions: {
    async unarchiveCampaign(campaignId) {
      try {
        const campaign = this.store.peekRecord('campaign', campaignId);
        await campaign.unarchive();
      } catch (err) {
        this.notifications.error('Une erreur est survenue');
      }
    }
  }
});
