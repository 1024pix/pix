import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class AttachTargetProfile extends Component {
  @tracked searchResults;
  @tracked selectedTargetProfile;

  @service store;

  get selectedTargetProfileValue() {
    if (!this.selectedTargetProfile?.id) {
      return '';
    }
    return `${this.selectedTargetProfile.id} - ${this.selectedTargetProfile.name}`;
  }

  get debounce() {
    return 250;
  }

  @action
  async onSearchValueInput(id, value) {
    const searchTerm = value?.trim();

    const isSearchById = searchTerm && /^\d+$/.test(searchTerm);
    const isSearchByName = searchTerm?.length >= 2;
    if (isSearchById || isSearchByName) {
      this.searchResults = await this.store.query('attachable-target-profile', { searchTerm });
    } else {
      this.searchResults = [];
    }
  }

  @action
  onSelectTargetProfile(targetProfile) {
    this.selectedTargetProfile = targetProfile;
    this.searchResults = [];
  }
}
