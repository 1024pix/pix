import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AttachTargetProfileController extends Controller {
  @service notifications;
  @service router;
  @service store;

  @tracked isSubmitDisabled = true;
  @tracked selectedTargetProfile;
  @tracked targetProfileBadges;

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
      this.isSubmitDisabled = false;
    }
  }

  @action
  onReset() {
    this.selectedTargetProfile = undefined;
    this.targetProfileBadges = undefined;
    this.isSubmitDisabled = true;
  }

  @action
  onBadgeUpdated({badges, update: {badgeId, fieldName, fieldValue}}) {
    console.log('A badge has been updated: ', {badges, update: {badgeId, fieldName, fieldValue}});
  }

  @action
  async onCancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }

  @action
  async onSubmit() {
    console.log('SUBMIT');
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }
}
