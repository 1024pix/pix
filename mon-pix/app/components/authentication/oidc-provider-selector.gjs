import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
      @id="oidc-provider-selector"
      @value={{this.selectedProvider}}
      @options={{this.providerOptions}}
      @onChange={{this.onProviderChange}}
      @hideDefaultOption="true"
      @isSearchable="true"
      @placeholder="Sélectionner un organisme"
      @searchLabel="Recherche par mot clé"
      @searchPlaceholder="Recherche par mot clé"
      class="oidc-provider-selector"
      ...attributes
    >
      <:label>Rechercher une organisation</:label>
    </PixSelect>
  </template>
}
