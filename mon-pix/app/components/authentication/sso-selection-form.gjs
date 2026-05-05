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

  @tracked selectedProviderId = null;

  @action
  async onProviderChange(selectedProviderId) {
    this.selectedProviderId = selectedProviderId;
  }

  get hasSelectedProvider() {
    return this.selectedProviderId !== null;
  }

  get selectedProviderName() {
    const provider = this.oidcIdentityProviders.visibleIdentityProviders.find(
      (provider) => provider.id === this.selectedProviderId,
    );
    if (!provider) return null;

    return provider.organizationName;
  }

  get shouldDisplayAccountRecoveryBanner() {
    const provider = this.oidcIdentityProviders.visibleIdentityProviders.find(
      (provider) => provider.id === this.selectedProviderId,
    );
    if (!provider) return false;

    return this.oidcIdentityProviders.shouldDisplayAccountRecoveryBanner(provider.code);
  }

  get accountRecoveryUrl() {
    return this.router.urlFor('account-recovery');
  }

  @action
  goToOidcProviderLoginPage() {
    this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress = true;
    const selectedOidcProviderSlug = this.oidcIdentityProviders.findBySlug(this.selectedProviderId).slug;
    this.router.transitionTo('authentication.login-oidc', selectedOidcProviderSlug);
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

      {{#if this.hasSelectedProvider}}
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
          @triggerAction={{this.goToOidcProviderLoginPage}}
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
          {{t "pages.authentication.sso-selection.login.message" providerName=this.selectedProviderName}}
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
