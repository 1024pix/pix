import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';

export default class LoginForm extends Component {
  <template>
    <form {{on "submit" this.authenticate}} class="login-form">
      <PixInput
        @id="login"
        @value={{this.login}}
        {{on "input" this.handleLoginInput}}
        @requiredLabel={{true}}
        type="text"
        autocomplete="username"
      >
        <:label>{{t "pages.sco-signup-or-login.login-form.fields.login.label"}}</:label>
      </PixInput>

      <PixInputPassword
        @id="password"
        @value={{this.password}}
        {{on "input" this.handlePasswordInput}}
        autocomplete="current-password"
        @requiredLabel={{true}}
      >
        <:label>{{t "pages.sco-signup-or-login.login-form.fields.password.label"}}</:label>
      </PixInputPassword>

      <PixButton id="submit-connexion" @type="submit" @isLoading={{this.isLoading}}>
        {{t "pages.sco-signup-or-login.login-form.button"}}
      </PixButton>

      {{#if this.errorMessage}}
        <div id="update-form-error-message" class="login-form__error-message error-message">{{this.errorMessage}}</div>
      {{/if}}
    </form>

    <div class="login-form__forgotten-password">
      <span>{{t "pages.sco-signup-or-login.login-form.forgotten-password.instruction"}}</span>
      <ul>
        <li>{{t "pages.sco-signup-or-login.login-form.forgotten-password.email"}}
          <LinkTo
            id="link_password-reset-demand"
            @route="password-reset-demand"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
          >
            {{t "pages.sco-signup-or-login.login-form.forgotten-password.reset-link"}}
          </LinkTo>
        </li>
        <li>
          {{t "pages.sco-signup-or-login.login-form.forgotten-password.other-identity"}}
        </li>
      </ul>
    </div>
  </template>
  @service session;
  @service store;
  @service router;
  @service currentUser;
  @service intl;
  @service errorMessages;

  @tracked login = null;
  @tracked password = null;
  @tracked isLoading = false;
  @tracked errorMessage = '';

  externalUserToken;
  expectedUserId;

  @action
  handleLoginInput(event) {
    this.login = event.target.value;
  }

  @action
  handlePasswordInput(event) {
    this.password = event.target.value;
  }

  @action
  async authenticate(event) {
    event && event.preventDefault();

    this.isLoading = true;
    this.isErrorMessagePresent = false;
    this.hasUpdateUserError = false;

    this.externalUserToken = this.session.externalUserTokenFromGar;
    this.expectedUserId = this.session.userIdForLearnerAssociation;

    if (this.externalUserToken) {
      await this._authenticateExternalUser(this.password, this.login);
    } else {
      await this._authenticatePixUser(this.password, this.login);
    }

    this.isLoading = false;
  }

  async _authenticatePixUser(password, login) {
    try {
      await this.session.authenticate('authenticator:oauth2', { login, password });
    } catch (response) {
      const shouldChangePassword = get(response, 'responseJSON.errors[0].title') === 'PasswordShouldChange';
      if (shouldChangePassword) {
        const passwordResetToken = response.responseJSON.errors[0].meta;
        this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
        return this.router.replaceWith('update-expired-password');
      }
      this._manageErrorsApi(response);
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
      await this.args.addGarAuthenticationMethodToUser(externalUserAuthenticationRequest);
    } catch (response) {
      const shouldChangePassword = get(response, 'errors[0].title') === 'PasswordShouldChange';
      if (shouldChangePassword) {
        const passwordResetToken = response.errors[0].meta;
        this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
        this.router.replaceWith('update-expired-password');
        return;
      }

      this._manageErrorsApi(response);
    }
  }

  _manageErrorsApi(errorsApi) {
    const error = errorsApi?.responseJSON || errorsApi;
    const errorCode = get(error, 'errors[0].code');

    if (errorCode === 'UNEXPECTED_USER_ACCOUNT') {
      const unexpectedUserAccountErrorMessage = this.intl.t(
        'pages.sco-signup-or-login.login-form.unexpected-user-account-error',
      );
      this.errorMessage = unexpectedUserAccountErrorMessage + get(error, 'errors[0].meta.value');
    } else {
      this.errorMessage = this.errorMessages.getAuthenticationErrorMessage(error);
    }
  }
}
