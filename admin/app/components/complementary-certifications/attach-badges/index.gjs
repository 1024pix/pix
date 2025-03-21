import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

import LinkToCurrentTargetProfile from '../common/link-to-current-target-profile';
import Badges from './badges/index';
import TargetProfileSelector from './target-profile-selector';

const DEFAULT_BADGE_LEVEL = '1';

export default class AttachBadges extends Component {
  @service pixToast;
  @service router;
  @service store;

  @tracked isSubmitDisabled = true;
  @tracked isSubmitting = false;
  @tracked selectedTargetProfile;

  #notifyOrganizations = true;
  #targetProfileBadges = new Map();

  get hasExternalJury() {
    return this.args.complementaryCertification.hasExternalJury;
  }

  @action
  async onError(errorMessage) {
    if (errorMessage) {
      this.pixToast.sendErrorNotification({ message: errorMessage });
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
      const complementaryCertification = this.args.complementaryCertification;

      const complementaryCertificationBadges = this.store.peekAll('complementary-certification-badge').toArray();

      complementaryCertificationBadges.forEach((complementaryCertificationBadge) => {
        complementaryCertification.complementaryCertificationBadges.removeObject(complementaryCertificationBadge);
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
          minimumEarnedPix: badge['minimum-earned-pix'],
        });
        complementaryCertification.complementaryCertificationBadges.pushObject(aBadge);
      });

      await complementaryCertification.save({
        adapterOptions: {
          attachBadges: true,
          targetProfileId: this.args.currentTargetProfile?.id,
          notifyOrganizations: this.#notifyOrganizations,
        },
      });

      this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');

      this.pixToast.sendSuccessNotification({
        message: `Profil cible rattaché à la certification ${complementaryCertification.label} mis à jour avec succès !`,
      });
    } catch (error) {
      console.error({ error });
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

  <template>
    <div class="page-section attach-target-profile">
      <h1 class="attach-target-profile__header">
        Rattacher un nouveau profil cible à la certification
        {{@complementaryCertification.label}}
      </h1>
      {{#if @currentTargetProfile}}
        <LinkToCurrentTargetProfile @model={{@currentTargetProfile}} />
      {{/if}}
      <form class="form" {{on "submit" this.onSubmit}}>
        <Card class="attach-target-profile__card" @title="1. Renseigner le nouveau profil cible à rattacher">
          <TargetProfileSelector
            @onError={{this.onError}}
            @onSelection={{this.onSelection}}
            @onChange={{this.onReset}}
          />
        </Card>

        {{#if this.selectedTargetProfile}}
          <Card
            class="attach-target-profile__card attach-target-profile__card-badges"
            @title="2. Complétez les informations des badges"
          >
            <Badges
              @targetProfile={{this.selectedTargetProfile}}
              @onError={{this.onError}}
              @onBadgeUpdated={{this.onBadgeUpdated}}
              @hasExternalJury={{this.hasExternalJury}}
            />
          </Card>
          {{#if @currentTargetProfile}}

            <div class="badge-edit-form__field attach-target-profile__notification">
              <PixCheckbox
                class="badge-edit-form__control attach-target-profile__notification__checkbox"
                @checked="false"
                {{on "change" this.onNotificationUpdated}}
              >
                <:label>Notifier les organisations avec une campagne basée sur l’ancien PC</:label>
              </PixCheckbox>

              <PixTooltip @position="top-left" @isLight={{true}} @isWide={{true}}>
                <:triggerElement>
                  <PixIcon @name="help" @plainIcon={{true}} @ariaHidden={{true}} />
                </:triggerElement>
                <:tooltip>
                  Un email sera envoyé à chaque membre de l'organisation
                </:tooltip>
              </PixTooltip>
            </div>
          {{/if}}
        {{/if}}

        <div class="attach-target-profile__actions">
          <PixButton
            @type="submit"
            @isDisabled={{this.isSubmitDisabled}}
            aria-disabled={{this.isSubmitDisabled}}
            @isLoading={{this.isSubmitting}}
          >
            Rattacher le profil cible
          </PixButton>
          <PixButton @variant="secondary" @triggerAction={{this.onCancel}}>
            {{t "common.actions.cancel"}}
          </PixButton>
        </div>
      </form>
    </div>
  </template>
}
