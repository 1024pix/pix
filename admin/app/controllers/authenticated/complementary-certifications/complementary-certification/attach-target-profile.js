import {action} from '@ember/object';
import {service} from '@ember/service';
import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';

export default class AttachTargetProfileController extends Controller {
  @service notifications;
  @service router;
  @service store;

  @tracked isSubmitDisabled = true;
  @tracked isSubmitting = false;
  @tracked selectedTargetProfile;
  #targetProfileBadges = new Map();

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
      this.#targetProfileBadges = new Map();
      this.isSubmitDisabled = false;
    }
  }

  @action
  onReset() {
    this.selectedTargetProfile = undefined;
    this.#targetProfileBadges = new Map();
    this.isSubmitDisabled = true;
    this.isSubmitting = false;
  }

  @action
  onBadgeUpdated({badges, update: {badgeId, fieldName, fieldValue}}) {
    console.log('A badge has been updated: ', {badges, update: {badgeId, fieldName, fieldValue}});
    this.#updateBadge({badgeId, fieldName, fieldValue});
  }

  @action
  async onCancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    this.isSubmitting = true;

    try {
      const complementaryCertification = this.model.complementaryCertification;

      this.#targetProfileBadges.forEach((badge, badgeId) => {
        const aBadge = this.store.createRecord('complementary-certification-badge', {
          complementaryCertification,
          badgeId,
          level: badge.level,
          imageUrl: badge['certificate-image'],
          label: badge['certificate-label'],
          certificateMessage: badge['certificate-message'],
          temporaryCertificateMessage: badge['certificate-temporary-message'],
          stickerUrl: badge['certificate-sticker'],
        });
        complementaryCertification.complementaryCertificationBadges.pushObject(aBadge);
      });

      await complementaryCertification.save({
        adapterOptions: {
          attachBadges: true,
          detachedTargetProfileId: this.model.currentTargetProfile.id,
          attachedTargetProfileId: this.selectedTargetProfile.id,
        }
      });
      this.notifications.success('Target profile rattaché avec succès');

    } catch (error) {
      console.log(error);
      this.store.peekAll('complementary-certification-badge').filterBy('isNew', true).forEach(function(model){
        model.deleteRecord();
      });
      await this.onError("Une erreur est survenue lors de l'enregistrement du profil cible.");
    } finally {
      this.isSubmitting = false;
    }
  }

  #updateBadge({badgeId, fieldName, fieldValue}) {
    const currentBadge = this.#targetProfileBadges.get(badgeId);
    this.#targetProfileBadges.set(badgeId, {
      ...currentBadge,
      id: badgeId,
      [fieldName]: fieldValue,
    });
  }
}
