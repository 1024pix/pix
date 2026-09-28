import { PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class AuthenticationIdentityProviders extends Component {
  @service oidcIdentityProviders;
  @service router;

  constructor() {
    super(...arguments);

    // This happens if the user goes backward after being redirected to the authentication page of
    // an OIDC Provider and we don't want the isLoading of the OIDC authentication button to still
    // be active, so that the user can use the button again.
    addEventListener('pageshow', () => {
      this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress = false;
    });
  }

  get queryParams() {
    const { isForSignup, invitationCode, invitationId } = this.args;
    if (invitationCode && invitationId) {
      return { invitationId, code: invitationCode, isForSignup };
    }
    return undefined;
  }

  <template>
    {{#if this.oidcIdentityProviders.hasVisibleIdentityProviders}}
      <section class="authentication-identity-providers-authentication-section">
        <p class="authentication-identity-providers-authentication-section__spacer">
          {{t "components.authentication.authentication-identity-providers.spacer.or"}}
        </p>

        <PixButtonLink
          @route="authentication.sso-selection"
          @query={{this.queryParams}}
          @isDisabled={{this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress}}
          @variant="secondary"
          class="authentication-identity-providers-authentication-section__button-link"
        >
          {{t "components.authentication.authentication-identity-providers.select-another-organization-link"}}

          <span class="authentication-identity-providers-authentication-section__chevron-right"></span>
        </PixButtonLink>
      </section>
    {{/if}}
  </template>
}
