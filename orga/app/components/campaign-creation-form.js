import Component from '@ember/component';

export default Component.extend({

  doCreateCampaign: null,

  campaign: null,
  askIdPix: null,
  wantToAddIdPix: false,
  targetProfiles: null,

  actions: {
    askLibeledIdPix() {
      this.set('wantToAddIdPix', true);
    },

    doNotAskLibeledIdPix() {
      this.set('campaign.idPix', null);
      this.set('wantToAddIdPix', false);
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
