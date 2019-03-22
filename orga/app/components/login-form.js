import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({

  session: inject(),

  email: null,
  password: null,

  isErrorMessagePresent: false,

  actions: {

    authenticate() {
      const email = this.email;
      const password = this.password;
      const scope = 'pix-orga';
      return this.session.authenticate('authenticator:oauth2', email, password, scope)
        .catch(() => {
          this.set('isErrorMessagePresent', true);
        });
    }

  }

});
