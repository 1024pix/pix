import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default Component.extend({

  classNames: [ 'signin-form-container' ],

  session: service(),
  displayErrorMessage: false,
  signin: null,
  email: '',
  password: '',
  urlHome: ENV.APP.HOME_HOST,

  displayMessageForCampaign: computed(function() {
    const intentUrl = this.get('session.attemptedTransition.intent.url') || '';
    return intentUrl.includes('campagnes');
  }),

  actions: {
    submit() {
      this.set('displayErrorMessage', false);
      this.get('onSubmit')(this.get('email'), this.get('password'))
        .catch(() => {
          this.set('displayErrorMessage', true);
        });
    }
  }

});
