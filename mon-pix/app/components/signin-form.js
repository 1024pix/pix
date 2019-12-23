import Component from '@ember/component';
import ENV from 'mon-pix/config/environment';

export default Component.extend({
  displayErrorMessage: false,
  username: '',
  password: '',
  urlHome: ENV.APP.HOME_HOST,

  actions: {
    signin() {
      this.set('displayErrorMessage', false);
      this.authenticateUser(this.username, this.password)
        .catch(() => {
          this.set('displayErrorMessage', true);
        });
    }
  }

});
