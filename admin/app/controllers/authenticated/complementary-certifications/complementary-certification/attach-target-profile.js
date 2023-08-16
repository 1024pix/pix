import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AttachTargetProfileController extends Controller {
  @service router;
  @service store;

  @tracked options = [];
  @tracked selectedTargetProfile;
  @tracked targetProfileBadges = [];

  get getTargetProfileBadgesErrorMessage() {

    if(!this.targetProfileBadges?.length > 0){
      return "PAS DE RT LA FAMILLE";
    }

    return;
  }

  @action
  async cancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }

  @action
  async onSelection(selectedAttachableTargetProfile) {
    this.selectedTargetProfile = selectedAttachableTargetProfile?.value;
    this.options = [];

    if(this.selectedTargetProfile?.id) {
      const targetProfile = await this.store.findRecord('target-profile', this.selectedTargetProfile?.id);
      this.targetProfileBadges = targetProfile?.badges?.map((badge) => ({
        id: badge.id,
        label: badge.title,
      }));
    }
  }

  @action
  onChange() {
    this.selectedTargetProfile = undefined;
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
        value: attachableTargetProfile,
      }));
    } else {
      this.options = [];
    }
  }
}
