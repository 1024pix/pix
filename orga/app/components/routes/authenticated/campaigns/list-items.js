import Component from '@ember/component';

export default Component.extend({
  actions: {
    selectCampaignCreator(creatorId) {
      return this.updateCampaignCreator(creatorId || null);
    }
  }
});
