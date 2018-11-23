import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  campaign: null,
  targetProfiles: null,

  wantIdPix: false,
  notWantIdPix: computed('wantIdPix', function() {
    return !this.get('wantIdPix');
  }),

  actions: {
    askLabelIdPix() {
      this.set('wantIdPix', true);
      this.set('campaign.idPixLabel', '');
    },

    doNotAskLabelIdPix() {
      this.set('wantIdPix', false);
      this.set('campaign.idPixLabel', null);
    },

    setSelectedTargetProfile(selectedTargetProfileId) {
      const selectedTargetProfile = this.targetProfiles
        .find((targetProfile) => targetProfile.get('id') === selectedTargetProfileId);
      this.get('campaign').set('targetProfile', selectedTargetProfile);
    },
  }
});
