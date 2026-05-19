import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class OidcProviderSelector extends Component {
  @tracked selectedIdentityProviderCode;
  @service locale;

  get providerOptions() {
    const { providers = [] } = this.args;
    return providers
      .map((provider) => ({ label: provider.organizationName, value: provider.code }))
      .sort((option1, option2) => option1.label.localeCompare(option2.label));
  }

  @action
  onProviderChange(value) {
    this.selectedIdentityProviderCode = value;

    if (this.args.onProviderChange) {
      this.args.onProviderChange(this.selectedIdentityProviderCode);
    }
  }

  <template>
    <PixSelect
      @hideDefaultOption="true"
      @id="oidc-provider-selector"
      @isSearchable={{true}}
      @onChange={{this.onProviderChange}}
      @options={{this.providerOptions}}
      @placeholder={{t "components.authentication.oidc-provider-selector.placeholder"}}
      @locale={{this.locale.currentLocale}}
      @searchPlaceholder={{t "components.authentication.oidc-provider-selector.searchLabel"}}
      @value={{this.selectedIdentityProviderCode}}
      class="oidc-provider-selector"
      ...attributes
    >
      <:label>{{t "components.authentication.oidc-provider-selector.label"}}</:label>
    </PixSelect>
  </template>
}
