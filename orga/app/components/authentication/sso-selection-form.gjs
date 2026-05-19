import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import OidcProviderSelector from './oidc-provider-selector';

export default class SsoSelectionForm extends Component {
  @service router;
  @service oidcIdentityProviders;

  @tracked selectedIdentityProviderCode = null;

  @action
  async onProviderChange(selectedIdentityProviderCode) {
    this.selectedIdentityProviderCode = selectedIdentityProviderCode;
  }

  get hasSelectedIdentityProvider() {
    return this.selectedIdentityProviderCode !== null;
  }

  get selectedIdentityProvider() {
    return this.oidcIdentityProviders.findByCode(this.selectedIdentityProviderCode);
  }

  get selectedIdentityProviderName() {
    return this.selectedIdentityProvider.organizationName;
  }

  @action
  goToIdentityProviderLoginPage() {
    this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress = true;
    this.router.transitionTo('authentication.oidc.flow', this.selectedIdentityProvider.slug);
  }

  <template>
    <section class="sso-selection-form">
      <h2 class="pix-title-s">
        {{t "pages.sso-selection.title"}}
      </h2>

      <p class="sso-selection-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <OidcProviderSelector
        @providers={{this.oidcIdentityProviders.visibleIdentityProviders}}
        @onProviderChange={{this.onProviderChange}}
      />

      {{#if this.hasSelectedIdentityProvider}}
        <PixButton
          @triggerAction={{this.goToIdentityProviderLoginPage}}
          @isLoading={{this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress}}
          aria-describedby="login-message"
        >
          {{#if @isForSignup}}
            {{t "pages.sso-selection.signup.button"}}
          {{else}}
            {{t "pages.sso-selection.login.button"}}
          {{/if}}
        </PixButton>

        <p id="login-message" class="sso-selection-form__login-message" aria-live="polite">
          {{t "pages.sso-selection.login.message" providerName=this.selectedIdentityProviderName}}
        </p>
      {{else}}
        <PixButton @type="button" @isDisabled={{true}}>
          {{#if @isForSignup}}
            {{t "pages.sso-selection.signup.button"}}
          {{else}}
            {{t "pages.sso-selection.login.button"}}
          {{/if}}
        </PixButton>
      {{/if}}
    </section>
  </template>
}
