import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { getHomeHost } from '../helpers/get-home-host';

export default Component.extend({
  session: service(),
  displayErrorMessage: false,
  email: '',
  password: '',
  urlHome: getHomeHost(),

  actions: {
    signin() {
      this.set('displayErrorMessage', false);
      this.authenticateUser(this.email, this.password)
        .catch(() => {
          this.set('displayErrorMessage', true);
        });
    }
  }

});
