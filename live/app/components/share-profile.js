import Ember from 'ember';

export default Ember.Component.extend({
  isShowingModal: false,

  actions: {
    toggleSharingModal() {
      this.toggleProperty('isShowingModal');
    }
  }
});
