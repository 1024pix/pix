import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { HttpStatusCodes } from '../http-status-code';

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
    } catch (response) {
      this.isErrorMessagePresent = true;
      this._manageErrorsApis(response);
    }
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  _manageErrorsApis(response) {

    if (response && response.errors && response.errors.length > 0) {
      const firstError = response.errors[0];
      switch (firstError.status) {
        case HttpStatusCodes.BAD_REQUEST.CODE:
          this.errorMessage = HttpStatusCodes.BAD_REQUEST.MESSAGE;
          break;
        case HttpStatusCodes.INTERNAL_SERVER_ERROR.CODE:
          this.errorMessage = HttpStatusCodes.INTERNAL_SERVER_ERROR.MESSAGE;
          break;
        case HttpStatusCodes.FORBIDDEN:
        case HttpStatusCodes.UNAUTHORIZED.CODE :
          this.errorMessage =  firstError.detail;
          break;
      }
    } else {
      this.errorMessage = HttpStatusCodes.INTERNAL_SERVER_ERROR.MESSAGE;
    }
  }

}
