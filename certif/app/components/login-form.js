import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({

  session: inject(),

  email: null,
  password: null,
  isPasswordVisible: false,
  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),

  isErrorMessagePresent: false,

  actions: {

    async authenticate() {
      const email = this.email ? this.email.trim() : '';
      const password = this.password;
      const scope = 'pix-certif';
      try {
        await this.session.authenticate('authenticator:oauth2', email, password, scope);
      } catch (err) {
        this.set('isErrorMessagePresent', true);
      }
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    }

  }

});
