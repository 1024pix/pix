import Ember from 'ember';

export default Ember.Component.extend({

  store: Ember.inject.service(),

  email: '',
  _displayErrorMessage: false,
  _displaySuccessMessage: false,

  actions: {

    savePasswordResetDemand() {
      this.set('_displayErrorMessage', false);
      this.set('_displaySuccessMessage', false);
      this.get('store').createRecord('password-reset-demand', { email: this.get('email') })
        .save()
        .then(() => {
          this.set('_displaySuccessMessage', true);
        })
        .catch(() => {
          this.set('_displayErrorMessage', true);
        });
    }

  }
});
