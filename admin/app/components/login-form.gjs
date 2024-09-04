import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import pick from 'ember-composable-helpers/helpers/pick';
import { t } from 'ember-intl';
import set from 'ember-set-helper/helpers/set';
import get from 'lodash/get';
import ENV from 'pix-admin/config/environment';

export default class LoginForm extends Component {
  @service url;
  @service intl;
  @service session;

  @tracked email;
  @tracked password;
  @tracked errorMessage;
  @service oidcIdentityProviders;

  get isGoogleIdentityProviderEnabled() {
    return this.oidcIdentityProviders.isProviderEnabled('google');
  }

  @action
  async authenticateUser(event) {
    event.preventDefault();
    const identification = this.email ? this.email.trim() : '';
    const password = this.password;
    const scope = ENV.APP.AUTHENTICATION.SCOPE;
    try {
      await this.session.authenticate('authenticator:oauth2', identification, password, scope);
    } catch (responseError) {
      this._handleApiError(responseError);
    }
  }

  _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'USER_IS_TEMPORARY_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
          url: this.url.forgottenPasswordUrl,
          htmlSafe: true,
        });
        break;
      case 'USER_IS_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY, {
          url: 'https://support.pix.org/support/tickets/new',
          htmlSafe: true,
        });
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
    <header class="login-page__header">
      <h1 class="login-page__header__title">Pix Admin</h1>
      <p class="login-form__information">{{t "pages.login.title"}}</p>
    </header>

    <section class="login-page__section--login-form">
      <form class="login-form" {{on "submit" this.authenticateUser}}>
        {{#if this.isGoogleIdentityProviderEnabled}}
          <LinkTo @route="authentication.login-oidc" @model="google" class="login-form__oidc-connect-link">
            <img src="/google-logo.svg" alt="" class="login-form__oidc-connect-link__logo" />
            <span class="login-form__oidc-connect-link__label">{{t "pages.login.google.label"}}</span>
          </LinkTo>

          {{#if @userShouldCreateAnAccount}}
            <PixMessage @type="alert">
              Vous n'avez pas de compte Pix.
            </PixMessage>
          {{/if}}

          {{#if @unknownErrorHasOccured}}
            <PixMessage @type="alert">
              Une erreur est survenue. Veuillez recommencer ou contacter les administrateurs de la plateforme.
            </PixMessage>
          {{/if}}

          {{#if @userShouldRequestAccess}}
            <PixMessage @type="alert">
              Vous n'avez pas les droits pour vous connecter. Veuillez demander un accès aux administrateurs de la
              plateforme.
            </PixMessage>
          {{/if}}
        {{else}}
          <PixInput
            required="true"
            @value={{this.email}}
            autocomplete="true"
            {{on "input" (pick "target.value" (set this "email"))}}
          >
            <:label>{{t "pages.login.fields.email.label"}} </:label>
          </PixInput>

          <PixInput
            required="true"
            type="password"
            @value={{this.password}}
            autocomplete="true"
            {{on "input" (pick "target.value" (set this "password"))}}
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
