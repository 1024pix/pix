import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Searchbar from 'pix-admin/components/complementary-certifications/attach-badges/target-profile-selector/searchbar';
import SelectedTargetProfile from 'pix-admin/components/complementary-certifications/attach-badges/target-profile-selector/selected-target-profile';

export default class TargetProfileSelectorComponent extends Component {
  @service notifications;
  @service store;

  @tracked attachableTargetProfiles = undefined;
  @tracked isAttachableTargetProfilesLoading = false;
  @tracked selectedTargetProfile;
  @tracked isNoResult = false;

  @action
  onChange() {
    this.selectedTargetProfile = undefined;
    this.attachableTargetProfiles = undefined;
    this.args.onChange();
  }

  @action
  async onSearch(value) {
    this.isNoResult = false;
    this.attachableTargetProfiles = undefined;
    const searchTerm = value?.trim();
    const isSearchById = searchTerm && /^\d+$/.test(searchTerm);
    const isSearchByName = searchTerm?.length >= 2;

    if (isSearchById || isSearchByName) {
      try {
        this.isAttachableTargetProfilesLoading = true;
        const attachableTargetProfiles = await this.store.query('attachable-target-profile', { searchTerm });

        if (attachableTargetProfiles.length === 0) {
          this.isNoResult = true;
          return;
        }

        this.attachableTargetProfiles = attachableTargetProfiles.map((attachableTargetProfile) => ({
          label: `${attachableTargetProfile.id} - ${attachableTargetProfile.name}`,
          value: attachableTargetProfile,
        }));
      } catch (e) {
        this.args.onError('Une erreur est survenue lors de la recherche de profils cibles.');
      } finally {
        this.isAttachableTargetProfilesLoading = false;
      }
    }
  }

  @action
  async onSelection(selectedAttachableTargetProfile) {
    if (selectedAttachableTargetProfile?.value?.id) {
      this.selectedTargetProfile = selectedAttachableTargetProfile.value;
      this.args.onSelection(selectedAttachableTargetProfile.value);
    }
  }

  <template>
    {{#if this.selectedTargetProfile}}
      <SelectedTargetProfile @onChange={{this.onChange}} @attachableTargetProfile={{this.selectedTargetProfile}} />
    {{else}}
      <Searchbar
        @onSelection={{this.onSelection}}
        @onSearch={{this.onSearch}}
        @options={{this.attachableTargetProfiles}}
        @isLoading={{this.isAttachableTargetProfilesLoading}}
        @isNoResult={{this.isNoResult}}
      />
    {{/if}}
  </template>
}
