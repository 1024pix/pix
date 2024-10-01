import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class OidcProviderSelector extends Component {
  @service oidcIdentityProviders;

  @tracked selectedProvider;

  get providerOptions() {
    const options = this.oidcIdentityProviders.list.map((provider) => ({
      label: provider.organizationName,
      value: provider.id,
    }));

    return options.sort((option1, option2) => option1.label.localeCompare(option2.label));
  }

  @action
  onProviderChange(value) {
    this.selectedProvider = value;

    if (this.args.onProviderChange) {
      this.args.onProviderChange(this.selectedProvider);
    }
  }

  <template>
    <PixSelect
      @hideDefaultOption="true"
      @id="oidc-provider-selector"
      @isSearchable="true"
      @onChange={{this.onProviderChange}}
      @options={{this.providerOptions}}
      @placeholder={{t "components.authentication.oidc-provider-selector.placeholder"}}
      @searchLabel={{t "components.authentication.oidc-provider-selector.searchLabel"}}
      @searchPlaceholder={{t "components.authentication.oidc-provider-selector.searchLabel"}}
      @value={{this.selectedProvider}}
      class="oidc-provider-selector"
      ...attributes
    >
      <:label>{{t "components.authentication.oidc-provider-selector.label"}}</:label>
    </PixSelect>
  </template>
}
