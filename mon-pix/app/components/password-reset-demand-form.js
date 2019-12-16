import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ENV from 'mon-pix/config/environment';

export default Component.extend({

  store: service(),

  email: '',
  _displayErrorMessage: false,
  _displaySuccessMessage: false,
  urlHome: ENV.APP.HOME_HOST,

  actions: {

    savePasswordResetDemand() {
      this.set('_displayErrorMessage', false);
      this.set('_displaySuccessMessage', false);

      const trimedEmail = this.email ? this.email.trim() : '';

      this.store.createRecord('password-reset-demand', { email: trimedEmail })
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
