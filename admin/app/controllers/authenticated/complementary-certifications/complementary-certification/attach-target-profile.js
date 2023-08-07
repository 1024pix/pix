import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AttachTargetProfileController extends Controller {
  @service router;
  @service store;

  @tracked options = [];

  @action
  async cancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }

  @action
  onSelection(selectedAttachableTargetProfile) {
    // TODO: PIX-8858
    console.log(selectedAttachableTargetProfile);
  }

  @action
  async onSearch(value) {
    const searchTerm = value?.trim();
    const isSearchById = searchTerm && /^\d+$/.test(searchTerm);
    const isSearchByName = searchTerm?.length >= 2;

    if (isSearchById || isSearchByName) {
      const attachableTargetProfiles = await this.store.query('attachable-target-profile', { searchTerm });

      this.options = attachableTargetProfiles.map((attachableTargetProfile) => ({
        label: `${attachableTargetProfile.id} - ${attachableTargetProfile.name}`,
        value: attachableTargetProfile.id,
      }));
    } else {
      this.options = [];
    }
  }
}
