import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class OtherAuthenticationProviders extends Component {
  @service oidcIdentityProviders;
  @service router;

  get ssoSelectionRoute() {
    const { isForSignup } = this.args;
    return isForSignup ? 'inscription.sso-selection' : 'authentication.sso-selection';
  }

  <template>
    <section class="authentication-other-authentication-providers-section">
      <h2 class="authentication-other-authentication-providers-section__heading">
        {{#if @isForSignup}}
          {{t "components.authentication.other-authentication-providers.signup-heading"}}
        {{else}}
          {{t "components.authentication.other-authentication-providers.login-heading"}}
        {{/if}}
      </h2>

      {{#if this.oidcIdentityProviders.featuredIdentityProvider}}
        <PixButtonLink
          @route="authentication.login-oidc"
          @model="{{this.oidcIdentityProviders.featuredIdentityProvider.slug}}"
          @variant="secondary"
          @size="large"
          class="authentication-other-authentication-providers-section__button-link"
        >
          <img
            src="/images/logo/identity-providers/{{this.oidcIdentityProviders.featuredIdentityProvider.slug}}.svg"
            alt=""
            class="authentication-other-authentication-providers-section__featured-identity-provider-logo"
          />

          {{t
            "components.authentication.other-authentication-providers.continue-with-featured-identity-provider-link"
            featuredIdentityProvider=this.oidcIdentityProviders.featuredIdentityProvider.organizationName
          }}</PixButtonLink>
      {{/if}}

      {{#if this.oidcIdentityProviders.hasOtherIdentityProviders}}
        <PixButtonLink
          @route={{this.ssoSelectionRoute}}
          @variant="secondary"
          @size="large"
          class="authentication-other-authentication-providers-section__button-link"
        >
          {{t "components.authentication.other-authentication-providers.select-another-organization-link"}}

          <span class="authentication-other-authentication-providers-section__chevron-right"></span>
        </PixButtonLink>
      {{/if}}
    </section>
  </template>
}
