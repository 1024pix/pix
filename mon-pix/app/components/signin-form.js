import { action } from '@ember/object';
import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class SigninForm extends Component {

  @tracked shouldDisplayErrorMessage = false;
  username = '';
  password = '';
  urlHome = ENV.APP.HOME_HOST;

  @action
  signin() {
    this.shouldDisplayErrorMessage = false;
    this.authenticateUser(this.username, this.password)
      .catch((err) => {
        const title = ('errors' in err) ? err.errors.get('firstObject').title : null;

        if (title === 'PasswordShouldChange') {
          this.updateExpiredPassword(this.username, this.password);
        }
        this.shouldDisplayErrorMessage = true;
      });
  }
}
