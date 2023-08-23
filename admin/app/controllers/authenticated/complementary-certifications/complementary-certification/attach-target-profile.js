import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AttachTargetProfileController extends Controller {
  @service notifications;
  @service router;
  @service store;

  @tracked selectedTargetProfile;
  @tracked targetProfileBadges;

  @action
  async cancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }

  @action
  async onError(errorMessage) {
    if (errorMessage) {
      this.notifications.error(errorMessage);
    }
  }

  @action
  async onSelection(selectedAttachableTargetProfile) {
    if (selectedAttachableTargetProfile) {
      this.selectedTargetProfile = selectedAttachableTargetProfile;
      this.targetProfileBadges = new Map();
    }
  }

  @action
  onReset() {
    this.selectedTargetProfile = undefined;
    this.targetProfileBadges = undefined;
  }

  @action
  onBadgeUpdated({ badgeId, badgeLevel }) {
    console.log('A badge level has been updated: ', { badgeId, badgeLevel });
    this.targetProfileBadges.set(badgeId, badgeLevel);
  }
}
