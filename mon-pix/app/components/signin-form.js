import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default Component.extend({
  session: service(),
  displayErrorMessage: false,
  email: '',
  password: '',
  urlHome: ENV.APP.HOME_HOST,

  actions: {
    signin() {
      this.set('displayErrorMessage', false);
      this.get('authenticateUser')(this.get('email'), this.get('password'))
        .catch(() => {
          this.set('displayErrorMessage', true);
        });
    }
  }

});
