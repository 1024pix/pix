import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  doCreateCampaign: null,

  campaign: null,
  askIdPix: null,
  wantToAddIdPix: false,
  targetProfiles: null,

  wantIdPix: '',
  notWantIdPix: computed('wantIdPix', function() {
    return this.get('wantIdPix') === 'checked' ? '' : 'checked';
  }),

  showLabelIdPixQuestion: computed('wantIdPix', function() {
    return this.get('wantIdPix') === 'checked';
  }),

  actions: {
    askLabelIdPix() {
      this.set('wantIdPix', 'checked');
    },

    doNotAskLabelIdPix() {
      this.set('wantIdPix', '');
      this.set('campaign.idPix', null);
    },

    submit() {
      this.get('doCreateCampaign')(this.get('campaign'));
    },

    setSelectedTargetProfile(selectedTargetProfileId) {
      const selectedTargetProfile = this.targetProfiles
        .find((targetProfile) => targetProfile.get('id') === selectedTargetProfileId);
      this.get('campaign').set('targetProfile', selectedTargetProfile);
    },
  }
});
