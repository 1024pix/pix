import Component from '@ember/component';

export default Component.extend({

  doCreateCampaign: null,

  campaign: null,
  targetProfiles: null,

  actions: {
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
