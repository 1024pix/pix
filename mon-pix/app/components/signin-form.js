import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';
import classic from 'ember-classic-decorator';

@classic
export default class SigninForm extends Component {

  @service url;
  @tracked shouldDisplayErrorMessage = false;
  username = '';
  password = '';

  get homeUrl() {
    return this.url.homeUrl;
  }

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
