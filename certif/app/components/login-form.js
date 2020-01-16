import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginForm extends Component {

  @service session;
  @tracked isPasswordVisible;
  @tracked isErrorMessagePresent;

  constructor() {
    super(...arguments);

    this.email = null;
    this.password = null;
    this.isPasswordVisible = false;
    this.isErrorMessagePresent = false;
  }

  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  @action
  async authenticate(event) {
    event.preventDefault();
    const email = this.email ? this.email.trim() : '';
    const password = this.password;
    const scope = 'pix-certif';
    try {
      await this.session.authenticate('authenticator:oauth2', email, password, scope);
    } catch (err) {
      this.isErrorMessagePresent =  true;
    }
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

}
