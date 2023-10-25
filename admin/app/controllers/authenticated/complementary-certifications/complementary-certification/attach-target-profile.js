import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_BADGE_LEVEL = '1';

export default class AttachTargetProfileController extends Controller {
  @service notifications;
  @service router;
  @service store;

  @tracked isSubmitDisabled = true;
  @tracked isSubmitting = false;
  @tracked selectedTargetProfile;

  #notifyOrganizations = true;
  #targetProfileBadges = new Map();

  get hasExternalJury() {
    return this.model.complementaryCertification.hasExternalJury;
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
      this.#targetProfileBadges = new Map();
      this.isSubmitDisabled = false;
    }
  }

  @action
  onReset() {
    this.selectedTargetProfile = undefined;
    this.#targetProfileBadges = new Map();
    this.#notifyOrganizations = true;
    this.isSubmitDisabled = true;
    this.isSubmitting = false;
  }

  @action
  onBadgeUpdated({ update: { badgeId, fieldName, fieldValue } }) {
    this.#updateBadge({ badgeId, fieldName, fieldValue });
  }

  @action
  onNotificationUpdated({ target }) {
    this.#notifyOrganizations = target.checked;
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

      this.store.peekAll('complementary-certification-badge').forEach(function (model) {
        model.deleteRecord();
      });

      this.#targetProfileBadges.forEach((badge, badgeId) => {
        const aBadge = this.store.createRecord('complementary-certification-badge', {
          complementaryCertification,
          badgeId,
          level: badge.level ?? DEFAULT_BADGE_LEVEL,
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
          targetProfileId: this.model.currentTargetProfile.id,
          notifyOrganizations: this.#notifyOrganizations,
        },
      });

      this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');

      this.notifications.success(
        `Profil cible rattaché à la certification ${complementaryCertification.label} mis à jour avec succès !`,
      );
    } catch (error) {
      await this.onError("Une erreur est survenue lors de l'enregistrement du profil cible.");
    } finally {
      this.isSubmitting = false;
    }
  }

  #updateBadge({ badgeId, fieldName, fieldValue }) {
    const currentBadge = this.#targetProfileBadges.get(badgeId);
    this.#targetProfileBadges.set(badgeId, {
      ...currentBadge,
      [fieldName]: fieldValue,
    });
  }
}
