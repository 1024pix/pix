import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({

  session: inject(),

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
      const scope = 'pix-orga';
      return this.session.authenticate('authenticator:oauth2', email, password, scope)
        .catch(() => {
          this.set('isErrorMessagePresent', true);
        })
        .finally(() => {
          this.set('isLoading', false);
        });
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    }

  }

});
