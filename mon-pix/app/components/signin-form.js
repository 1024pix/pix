import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SigninForm extends Component {

  @service url;
  @tracked hasFailed = false;
  username = '';
  password = '';

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async signin(event) {
    event && event.preventDefault();
    
    this.hasFailed = false;
    try {
      await this.args.authenticateUser(this.username, this.password);
    } catch (err) {
      const title = ('errors' in err) ? err.errors.get('firstObject').title : null;

      if (title === 'PasswordShouldChange') {
        await this.args.updateExpiredPassword(this.username, this.password);
      }
      this.hasFailed = true;
    }
  }
}
