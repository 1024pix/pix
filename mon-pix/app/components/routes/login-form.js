import { action, computed } from '@ember/object';
import { inject } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class LoginForm extends Component {
  @inject()
  session;

  @inject()
  store;

  login = null;
  password = null;
  isLoading = false;
  isPasswordVisible = false;

  @computed('isPasswordVisible')
  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  isErrorMessagePresent = false;

  @action
  authenticate() {
    this.set('isLoading', true);
    const login = this.login;
    const password = this.password;

    this._authenticate(password, login);
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
  }

  async _authenticate(password, login) {
    const scope = 'mon-pix';
    try {
      await this.session.authenticate('authenticator:oauth2', { login, password, scope });
    } catch (e) {
      this.set('isErrorMessagePresent', true);
    }
    this.set('isLoading', false);
  }
}
