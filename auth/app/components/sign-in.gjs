import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixButton from '@1024pix/pix-ui/components/pix-button';

const SSO_LOGO_BASE_URL = 'https://assets.pix.org/sso-logos/';
const SSO_LOGO_BASE_FILE_PREFIX = 'sso-logo-';

export default class SignIn extends Component {
  @service authentication;
  @service oidcIdentityProviders;

  @tracked email = 'superadmin@example.net';
  @tracked password = 'pix123';

  @action
  async handleSubmit(event) {
    event.preventDefault();

    const {
      scope,
      state,
      codeChallenge,
      codeChallengeMethod,
      redirectUri,
      clientId,
    } = this.args.model;

    try {
      await this.authentication.authenticate({
        clientId,
        redirectUri,
        codeChallenge,
        codeChallengeMethod,
        scope,
        state,
        credentials: {
          username: this.email,
          password: this.password,
        },
      });
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }

  getSsoLogoUrl(ssoProvider) {
    return `${SSO_LOGO_BASE_URL}${SSO_LOGO_BASE_FILE_PREFIX}${ssoProvider.code}.svg`;
  }

  get ssoProviders() {
    return this.oidcIdentityProviders.list;
  }

  get redirectUri() {
    return decodeURIComponent(this.args.model.redirectUri);
  }

  get shouldShowGoogleSSOLogin() {
    return this.ssoProviders.some(
      (ssoProvider) =>
        ssoProvider.source === 'google' && this.args.variant === 'admin',
    );
  }

  @action
  onChangeEmail(event) {
    this.email = event.target.value;
  }

  @action
  onChangePassword(event) {
    this.password = event.target.value;
  }

  <template>
    <div class="form-container">
      <form {{on "submit" this.handleSubmit}} class="authentication-login-form">
        <PixInput
          @id="email"
          name="email"
          {{on "input" this.onChangeEmail}}
          placeholder="email"
          autocomplete="email"
          aria-required="true"
          @value={{this.email}}
        >
          <:label>Email</:label>
        </PixInput>

        <PixInput
          @id="password"
          name="password"
          type="password"
          {{on "input" this.onChangePassword}}
          @value={{this.password}}
          autocomplete="current-password"
          aria-required="true"
        >
          <:label>Mot de passe</:label>
        </PixInput>

        <PixButton @type="submit" @isLoading={{this.isLoading}}>
          Sign in
        </PixButton>
      </form>

      {{#if this.shouldShowGoogleSSOLogin}}
        {{#each this.ssoProviders as |ssoProvider|}}
          <LinkTo
            @route="authentication.login-oidc"
            @model="{{ssoProvider.slug}}"
            class="login-form__oidc-connect-link"
          >
            <img
              src="{{this.getSsoLogoUrl ssoProvider}}"
              alt=""
              class="login-form__oidc-connect-link__logo"
            />
            <span class="login-form__oidc-connect-link__label">Connexion google</span>
          </LinkTo>
        {{/each}}
      {{/if}}
    </div>
  </template>
}
