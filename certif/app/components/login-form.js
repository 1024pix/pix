import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginForm extends Component {

  @service session;
  @tracked isPasswordVisible;
  @tracked isErrorMessagePresent;

  @tracked errorMessage;

  constructor() {
    super(...arguments);

    this.email = null;
    this.password = null;
    this.isPasswordVisible = false;
    this.isErrorMessagePresent = false;
    this.errorMessage = null;
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
    } catch (error) {
      this.isErrorMessagePresent =  true;
      if (error && error.errors && error.errors.length > 0) {
        this.errorMessage = error.errors[0].detail;
      } else {
        this.errorMessage = 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.';
      }
    }
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

}
