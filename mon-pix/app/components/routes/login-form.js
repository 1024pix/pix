/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import get from 'lodash/get';

import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import { inject } from '@ember/service';
import { action, computed } from '@ember/object';

@classic
export default class LoginForm extends Component {

  @inject session;
  @inject store;
  @inject router;
  @inject intl;

  login = null;
  password = null;

  externalUserToken = null;
  expectedUserId = null;

  isLoading = false;
  isPasswordVisible = false;
  isErrorMessagePresent = false;
  hasUpdateUserError = false;
  updateErrorMessage = '';

  @computed('isPasswordVisible')
  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
  }

  @action
  async authenticate() {
    this.set('isLoading', true);
    this.set('isErrorMessagePresent', false);
    this.set('hasUpdateUserError', false);

    const login = this.login;
    const password = this.password;

    this.set('externalUserToken', this.session.get('data.externalUser'));
    this.set('expectedUserId', this.session.get('data.expectedUserId'));

    if (this.externalUserToken) {
      await this._authenticateExternalUser(password, login);
    } else {
      await this._authenticate(password, login);
    }

    this.set('isLoading', false);
  }

  async _authenticate(password, login) {
    const scope = 'mon-pix';
    try {
      await this.session.authenticate('authenticator:oauth2', { login, password, scope });
    } catch (response) {
      const shouldChangePassword = get(response, 'responseJSON.errors[0].title') === 'PasswordShouldChange';
      if (shouldChangePassword) {
        this.store.createRecord('user', { username: this.login, password: this.password });
        return this.router.replaceWith('update-expired-password');
      }
      this.set('isErrorMessagePresent', true);
    }
  }

  async _authenticateExternalUser(password, login) {
    try {
      const externalUserAuthenticationRequest = this.store.createRecord('external-user-authentication-request', {
        username: login,
        password,
        externalUserToken: this.externalUserToken,
        expectedUserId: this.expectedUserId,
      });
      await this.addGarAuthenticationMethodToUser(externalUserAuthenticationRequest);
    } catch (err) {
      const title = ('errors' in err) ? err.errors.get('firstObject').title : null;
      if (title === 'PasswordShouldChange') {
        this.store.createRecord('user', { username: this.login, password: this.password });
        return this.router.replaceWith('update-expired-password');
      }
      this._manageErrorsApi(err);
      this.set('hasUpdateUserError', true);
    }
  }

  _manageErrorsApi(errorsApi) {
    const defaultErrorMessage = this.intl.t('api-error-messages.internal-server-error');
    const errorMessageStatusCode4xx = this.intl.t('api-error-messages.bad-request-error');
    const invalidCredentialsErrorMessage = this.intl.t('pages.login-or-register.login-form.error');
    const unexpectedUserAccountErrorMessage = this.intl.t('pages.login-or-register.login-form.unexpected-user-account-error');

    let errorMessage = defaultErrorMessage;

    const errorStatus = get(errorsApi, 'errors[0].status');
    const errorCode = get(errorsApi, 'errors[0].code');

    if (errorStatus && errorStatus.toString().startsWith('4')) {
      if (errorCode && errorCode === 'UNEXPECTED_USER_ACCOUNT') {
        errorMessage = unexpectedUserAccountErrorMessage + get(errorsApi, 'errors[0].meta.value');
      } else if (errorStatus && errorStatus === '401') {
        errorMessage = invalidCredentialsErrorMessage;
      } else {
        errorMessage = errorMessageStatusCode4xx;
      }
    }

    this.set('updateErrorMessage', errorMessage);
  }

}
