import Component from '@ember/component';

export default Component.extend({

  doCreateCampaign: null,

  campaign: null,

  actions: {
    submit() {
      this.get('doCreateCampaign')(this.get('campaign'));
    }
  }
});
