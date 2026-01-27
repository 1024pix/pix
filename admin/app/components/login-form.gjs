import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import ENV from 'pix-admin/config/environment';

// For example:
// https://assets.pix.org/sso-logos/sso-logo-PIXADMIN-PROCONNECT.svg
const SSO_LOGO_BASE_URL = 'https://assets.pix.org/sso-logos/';
const SSO_LOGO_BASE_FILE_PREFIX = 'sso-logo-';

export default class LoginForm extends Component {
  @service config;
  @service url;
  @service intl;
  @service session;

  @tracked email;
  @tracked password;
  @tracked errorMessage;
  @service oidcIdentityProviders;

  get permitPixAdminLoginFromPassword() {
    return this.config.permitPixAdminLoginFromPassword;
  }

  get useSsoProviders() {
    return this.oidcIdentityProviders.hasIdentityProviders;
  }

  get ssoProviders() {
    return this.oidcIdentityProviders.list;
  }

  getSsoLogoUrl(ssoProvider) {
    return `${SSO_LOGO_BASE_URL}${SSO_LOGO_BASE_FILE_PREFIX}${ssoProvider.code}.svg`;
  }

  @action
  async authenticateUser(event) {
    event.preventDefault();
    const identification = this.email ? this.email.trim() : '';
    const password = this.password;
    try {
      await this.session.authenticate('authenticator:oauth2', identification, password);
    } catch (responseError) {
      this._handleApiError(responseError);
    }
  }

  @action
  onEmailChange(event) {
    this.email = event.target.value;
  }

  @action
  onPasswordChange(event) {
    this.password = event.target.value;
  }

  _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'USER_IS_TEMPORARY_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
          url: this.url.pixAppForgottenPasswordUrl,
          htmlSafe: true,
        });
        break;
      case 'USER_IS_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY, {
          url: 'https://support.pix.org/support/tickets/new',
          htmlSafe: true,
        });
        break;
      case 'PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED.I18N_KEY);
        break;
      default:
        this.errorMessage = this.intl.t(this._getI18nKeyByStatus(responseError.status));
    }
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case 400:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 401:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY;
      // TODO: This case should be handled with a specific error code like USER_IS_TEMPORARY_BLOCKED or USER_IS_BLOCKED
      case 403:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_NO_PERMISSION.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }

  <template>
    <header class="login-page-header">
      <img class="login-page-header__logo" src="/admin-logo.svg" alt={{t "common.pix-admin"}} />
      <p class="login-form__information">{{t "pages.login.title"}}</p>
    </header>

    <section class="login-page__section--login-form">
      <form class="login-form" {{on "submit" this.authenticateUser}}>
        {{#if this.useSsoProviders}}
          {{#each this.ssoProviders as |ssoProvider|}}
            <LinkTo
              @route="authentication.login-oidc"
              @model="{{ssoProvider.slug}}"
              class="login-form__oidc-connect-link"
            >
              <img src="{{this.getSsoLogoUrl ssoProvider}}" alt="" class="login-form__oidc-connect-link__logo" />
              <span class="login-form__oidc-connect-link__label">{{t
                  "pages.login.authenticate-with-sso-provider"
                  ssoProviderName=ssoProvider.organizationName
                }}</span>
            </LinkTo>
          {{/each}}
          {{#if @userShouldCreateAnAccount}}
            <PixNotificationAlert @type="error">
              Vous n'avez pas de compte Pix.
            </PixNotificationAlert>
          {{/if}}

          {{#if @unknownErrorHasOccured}}
            <PixNotificationAlert @type="error">
              Une erreur est survenue. Veuillez recommencer ou contacter les administrateurs de la plateforme.
            </PixNotificationAlert>
          {{/if}}

          {{#if @userShouldRequestAccess}}
            <PixNotificationAlert @type="error">
              Vous n'avez pas les droits pour vous connecter. Veuillez demander un accès aux administrateurs de la
              plateforme.
            </PixNotificationAlert>
          {{/if}}
        {{/if}}
        {{#if this.permitPixAdminLoginFromPassword}}
          <PixInput required="true" @value={{this.email}} autocomplete="true" {{on "input" this.onEmailChange}}>
            <:label>{{t "pages.login.fields.email.label"}} </:label>
          </PixInput>

          <PixInput
            required="true"
            type="password"
            @value={{this.password}}
            autocomplete="true"
            {{on "input" this.onPasswordChange}}
          >
            <:label>{{t "pages.login.fields.password.label"}} </:label>
          </PixInput>

          {{#if this.errorMessage}}
            <p class="login-form__error">{{this.errorMessage}}</p>
          {{/if}}

          <PixButton @type="submit" class="login-form__button">{{t "pages.login.button"}}</PixButton>
        {{/if}}
      </form>
    </section>
  </template>
}
