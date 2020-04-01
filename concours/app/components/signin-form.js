import { action } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class SigninForm extends Component {
  displayErrorMessage = false;
  username = '';
  password = '';
  urlHome = ENV.APP.HOME_HOST;

  @action
  signin() {
    this.set('displayErrorMessage', false);
    this.authenticateUser(this.username, this.password)
      .catch(() => {
        this.set('displayErrorMessage', true);
      });
  }
}
