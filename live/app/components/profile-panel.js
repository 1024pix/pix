import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['profile-panel'],
  competences: null,
  totalPixScore: null,

  isShowingModal: false,

  actions: {
    toggleSharingModal() {
      this.toggleProperty('isShowingModal');
    }
  }
});
