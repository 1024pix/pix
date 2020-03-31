import { action } from '@ember/object';
import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class SigninForm extends Component {

  @tracked displayErrorMessage = false;
  username = '';
  password = '';
  urlHome = ENV.APP.HOME_HOST;

  @action
  signin() {
    this.displayErrorMessage = false;
    this.authenticateUser(this.username, this.password)
      .catch((err) => {
        const title = ('errors' in err) ? err.errors.get('firstObject').title : null;

        if (title === 'PasswordShouldChange') {
          this.updateExpiredPassword(this.username, this.password);
        }
        this.displayErrorMessage = true;
      });
  }
}
