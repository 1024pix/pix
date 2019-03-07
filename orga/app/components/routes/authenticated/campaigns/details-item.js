import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  participationsCount: computed('campaign.campaignReport.participationsCount', function() {
    const participationsCount = this.get('campaign.campaignReport.participationsCount');

    return participationsCount > 0 ? participationsCount : '-';
  }),

  sharedParticipationsCount: computed('campaign.campaignReport.sharedParticipationsCount', function() {
    const sharedParticipationsCount = this.get('campaign.campaignReport.sharedParticipationsCount');

    return sharedParticipationsCount > 0 ? sharedParticipationsCount : '-';
  }),
});
