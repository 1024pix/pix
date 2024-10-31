import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import OidcProviderSelector from './oidc-provider-selector';

// It will be managed through an API property in the future
const EXCLUDED_PROVIDER_CODES = ['FWB', 'GOOGLE'];

export default class SsoSelectionForm extends Component {
  @service router;
  @service oidcIdentityProviders;

  @tracked selectedProviderId = null;

  @action
  async onProviderChange(selectedProviderId) {
    this.selectedProviderId = selectedProviderId;
  }

  get providers() {
    return this.oidcIdentityProviders.list?.filter((provider) => !EXCLUDED_PROVIDER_CODES.includes(provider.code));
  }

  get hasSelectedProvider() {
    return this.selectedProviderId !== null;
  }

  get selectedProviderName() {
    const provider = this.oidcIdentityProviders.list?.find((provider) => provider.id === this.selectedProviderId);
    if (!provider) return null;

    return provider.organizationName;
  }

  <template>
    <section class="sso-selection-form">
      <h2 class="pix-title-s">
        {{t "pages.authentication.sso-selection.title"}}
      </h2>

      <p class="sso-selection-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <OidcProviderSelector @providers={{this.providers}} @onProviderChange={{this.onProviderChange}} />

      {{#if this.hasSelectedProvider}}
        <PixButtonLink
          aria-describedby="signin-message"
          @route="authentication.login-oidc"
          @model={{this.selectedProviderId}}
        >
          {{t "pages.authentication.sso-selection.signin.link"}}
        </PixButtonLink>

        <p id="signin-message" class="sso-selection-form__signin-message" aria-live="polite">
          {{t "pages.authentication.sso-selection.signin.message" providerName=this.selectedProviderName}}
        </p>
      {{else}}
        <PixButton @type="button" @isDisabled={{true}}>
          {{t "pages.authentication.sso-selection.signin.link"}}
        </PixButton>
      {{/if}}
    </section>
  </template>
}
