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

  @tracked selectedProvider = null;

  @action
  async onProviderChange(selectedProvider) {
    this.selectedProvider = selectedProvider;
  }

  get providers() {
    return this.oidcIdentityProviders.list?.filter((provider) => !EXCLUDED_PROVIDER_CODES.includes(provider.code));
  }

  get isButtonDisabled() {
    return this.selectedProvider === null;
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

      {{#if this.isButtonDisabled}}
        <PixButton @type="button" @isDisabled={{true}} @size="large">
          {{t "pages.authentication.sso-selection.signin.link"}}
        </PixButton>
      {{else}}
        <PixButtonLink @route="authentication.login-oidc" @model={{this.selectedProvider}} @size="large">
          {{t "pages.authentication.sso-selection.signin.link"}}
        </PixButtonLink>
      {{/if}}
    </section>
  </template>
}
