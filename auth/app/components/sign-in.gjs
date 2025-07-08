import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import {LinkTo} from "@ember/routing";

// For example:
// https://assets.pix.org/sso-logos/sso-logo-PIXADMIN-PROCONNECT.svg
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
        username: this.email,
        password: this.password,
        scope,
        state,
        codeChallenge,
        codeChallengeMethod,
        redirectUri,
        clientId,
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

  @action
  onChangeEmail(event) {
    this.email = event.target.value;
  }

  @action
  onChangePassword(event) {
    this.password = event.target.value;
  }

  <template>


  {{#each this.ssoProviders as |ssoProvider|}}
    <LinkTo
      @route="authentication.login-oidc"
      @model="{{ssoProvider.slug}}"
      class="login-form__oidc-connect-link"
    >
      <img src="{{this.getSsoLogoUrl ssoProvider}}" alt="" class="login-form__oidc-connect-link__logo" />
      <span class="login-form__oidc-connect-link__label">coucou</span>
    </LinkTo>
  {{/each}}


    <h1>Connexion à
      {{@model.clientId}}
      et redirige vers
      {{this.redirectUri}}
    </h1>



    <form {{on "submit" this.handleSubmit}}>
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        name="email"
        placeholder="Email"
        value={{this.email}}
        {{on "input" this.onChangeEmail}}
      />

      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        name="password"
        placeholder="Password"
        value={{this.password}}
        {{on "input" this.onChangePassword}}
      />

      <button type="submit">Sign in</button>
    </form>
  </template>
}

