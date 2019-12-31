import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({

  session: inject(),
  store: inject(),

  email: null,
  password: null,
  isLoading: false,
  isPasswordVisible: false,
  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),

  isErrorMessagePresent: false,

  actions: {
    authenticate() {
      this.set('isLoading', true);
      const email = this.email;
      const password = this.password;

      this._authenticate(password, email);
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    }

  },

  async _authenticate(password, email) {
    const scope = 'mon-pix';
    try {
      await this.session.authenticate('authenticator:oauth2', { email, password, scope });
    } catch (e) {
      this.set('isErrorMessagePresent', true);
    }
    this.set('isLoading', false);
  }

});
