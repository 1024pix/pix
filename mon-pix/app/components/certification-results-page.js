import Component from '@ember/component';

export default Component.extend({
  classNames: ['certification-results-page'],

  validSupervisor: false,
  notFinishedYet: true,

  actions: {
    validateBySupervisor: function() {
      if (this.validSupervisor) {
        this.set('notFinishedYet', false);
      }
    }
  }
});
