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
  @inject currentUser;
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

    await this._authenticate(password, login);
    await this._addGarAuthenticationMethodToUser();

    this.set('isLoading', false);
  }

  async _authenticate(password, login) {
    const scope = 'mon-pix';

    if (this.externalUserToken) {
      this.session.set('attemptedTransition', {
        retry: () => {
        },
      });
    }

    try {
      await this.session.authenticate('authenticator:oauth2', { login, password, scope });
    } catch (err) {
      const title = ('errors' in err) ? err.errors.get('firstObject').title : null;
      if (title === 'PasswordShouldChange') {
        this.store.createRecord('user', { username: this.login, password: this.password });
        this.session.set('attemptedTransition', {
          retry: () => {
            this._addGarAuthenticationMethodToUser();
          },
        });
        return this.router.replaceWith('update-expired-password');
      }
      this.set('isErrorMessagePresent', true);
    }
  }

  async _addGarAuthenticationMethodToUser() {
    if (this.session.isAuthenticated && this.externalUserToken) {
      try {
        await this.addGarAuthenticationMethodToUser(this.externalUserToken, this.expectedUserId);
      } catch (response) {
        await this.session.invalidate();

        this._manageErrorsApi(response);
        this.set('hasUpdateUserError', true);
      }
    }
  }

  _manageErrorsApi(errorsApi) {
    const defaultErrorMessage = this.intl.t('api-error-messages.internal-server-error');
    const errorMessageStatusCode4xx = this.intl.t('api-error-messages.bad-request-error');
    const unexpectedUserAccountErrorMessage = this.intl.t('pages.login-or-register.login-form.unexpected-user-account-error');

    let errorMessage = defaultErrorMessage;

    const errorStatus = get(errorsApi, 'errors[0].status');
    const errorCode = get(errorsApi, 'errors[0].code');

    if (errorStatus && errorStatus.toString().startsWith('4')) {
      if (errorCode && errorCode === 'UNEXPECTED_USER_ACCOUNT') {
        errorMessage = unexpectedUserAccountErrorMessage + get(errorsApi, 'errors[0].meta.value');
      } else {
        errorMessage = errorMessageStatusCode4xx;
      }
    }

    this.set('updateErrorMessage', errorMessage);
  }

}
