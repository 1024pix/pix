import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({

  session: inject(),

  email: null,
  password: null,

  isErrorMessagePresent: false,

  actions: {

    authenticate() {
      const email = this.get('email');
      const password = this.get('password');
      const scope = 'pix-orga';
      return this.get('session').authenticate('authenticator:oauth2', email, password, scope)
        .catch(() => {
          this.set('isErrorMessagePresent', true);
        });
    }

  }

});
