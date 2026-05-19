import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
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

  get shouldDisplayAccountRecoveryBanner() {
    return this.oidcIdentityProviders.shouldDisplayAccountRecoveryBanner(this.selectedIdentityProviderCode);
  }

  get accountRecoveryUrl() {
    return this.router.urlFor('account-recovery');
  }

  @action
  goToIdentityProviderLoginPage() {
    this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress = true;
    this.router.transitionTo('authentication.login-oidc', this.selectedIdentityProvider.slug);
  }

  <template>
    <section class="sso-selection-form">
      <h2 class="pix-title-s">
        {{t "pages.authentication.sso-selection.title"}}
      </h2>

      <p class="sso-selection-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <OidcProviderSelector
        @providers={{this.oidcIdentityProviders.visibleIdentityProviders}}
        @onProviderChange={{this.onProviderChange}}
      />

      {{#if this.hasSelectedIdentityProvider}}
        {{#if this.shouldDisplayAccountRecoveryBanner}}
          <PixNotificationAlert class="sso-selection-form__should-display-account-recovery-banner">
            {{t
              "components.authentication.sso-selection-form.should-display-account-recovery-banner"
              url=this.accountRecoveryUrl
              htmlSafe=true
            }}
          </PixNotificationAlert>
        {{/if}}

        <PixButton
          @triggerAction={{this.goToIdentityProviderLoginPage}}
          @isLoading={{this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress}}
          aria-describedby="signin-message"
        >
          {{#if @isForSignup}}
            {{t "pages.authentication.sso-selection.signup.button"}}
          {{else}}
            {{t "pages.authentication.sso-selection.login.button"}}
          {{/if}}
        </PixButton>

        <p id="signin-message" class="sso-selection-form__signin-message" aria-live="polite">
          {{t "pages.authentication.sso-selection.login.message" providerName=this.selectedIdentityProviderName}}
        </p>
      {{else}}
        <PixButton @type="button" @isDisabled={{true}}>
          {{#if @isForSignup}}
            {{t "pages.authentication.sso-selection.signup.button"}}
          {{else}}
            {{t "pages.authentication.sso-selection.login.button"}}
          {{/if}}
        </PixButton>
      {{/if}}
    </section>
  </template>
}
