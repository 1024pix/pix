import Component from '@ember/component';

export default Component.extend({

  displayRegisterForm: true,

  actions: {
    toggleFormsVisibility() {
      this.toggleProperty('displayRegisterForm');
    },
  }
});
