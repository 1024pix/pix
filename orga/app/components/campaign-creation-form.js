import Component from '@ember/component';

export default Component.extend({

  doCreateCampaign: null,

  campaign: null,
  targetProfiles: null,

  actions: {
    submit() {
      this.get('doCreateCampaign')(this.get('campaign'));
    },

    setSelectedTargetProfile: function(selectedTargetProfileId) {
      this.get('campaign').set('targetProfile', selectedTargetProfileId)
    },
  }
});
