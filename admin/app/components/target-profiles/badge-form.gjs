import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Card from '../card';
import Criteria from './badge-form/criteria';

export default class BadgeForm extends Component {
  @service pixToast;
  @service store;
  @service router;

  BASE_URL = 'https://images.pix.fr/badges/';

  badge = {
    key: '',
    altMessage: '',
    message: '',
    title: '',
    isCertifiable: false,
    isAlwaysVisible: false,
    campaignThreshold: null,
    cappedTubesCriteria: [],
  };

  imageName = '';

  @action
  updateFormValue(key, event) {
    if (key === 'imageName') {
      this.imageName = event.target.value;
    } else {
      this.badge[key] = event.target.value;
    }
  }

  @action
  updateFormCheckBoxValue(key) {
    this.badge[key] = !this.badge[key];
  }

  @action
  async submitBadgeCreation(event) {
    event.preventDefault();

    const hasCampaignCriteria = this.badge.campaignThreshold;
    const hasCappedTubesCriteria = this.badge.cappedTubesCriteria.length;

    if (!hasCampaignCriteria && !hasCappedTubesCriteria) {
      return this.pixToast.sendErrorNotification({
        message: "Vous devez sélectionner au moins un critère d'obtention de badge",
      });
    }

    const hasSelectedCappedTubes = this.badge.cappedTubesCriteria[0]?.cappedTubes?.length;

    if (hasCappedTubesCriteria && !hasSelectedCappedTubes) {
      return this.pixToast.sendErrorNotification({
        message: 'Vous devez sélectionner au moins un sujet du profil cible',
      });
    }

    await this._createBadge();
  }

  async _createBadge() {
    try {
      const badgeWithFormattedImageUrl = {
        ...this.badge,
        imageUrl: this.BASE_URL + this.imageName,
      };

      const badge = this.store.createRecord('badge', badgeWithFormattedImageUrl);

      await badge.save({
        adapterOptions: { targetProfileId: this.args.targetProfile.id },
      });
      await this.args.targetProfile.reload();

      this.pixToast.sendSuccessNotification({ message: 'Le badge a été créé.' });
      this.router.transitionTo('authenticated.target-profiles.target-profile.insights');
      return badge;
    } catch (error) {
      console.error(error);
      this.pixToast.sendErrorNotification({ message: `${error.errors[0].detail}` });
    }
  }

  <template>
    <form class="admin-form admin-form--badge-form" {{on "submit" this.submitBadgeCreation}}>
      <h2 class="badge-form__title">Création d'un badge</h2>
      <section class="admin-form__content admin-form__content--with-counters">
        <Card class="create-target-profile__card" @title="Remplir des informations sur le badge">
          <div class="badge-form__text-field">
            <PixInput
              @id="title"
              @value={{this.badge.title}}
              @requiredLabel={{t "common.forms.mandatory"}}
              {{on "change" (fn this.updateFormValue "title")}}
            >
              <:label>Nom du badge :</:label>
            </PixInput>
          </div>
          <div class="badge-form__text-field">
            <p class="badge-form__information">
              <a
                class="badge-form__information--link"
                href="https://1024pix.github.io/pix-images-list/viewer.html?directory=badges"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir la liste des badges
              </a>
            </p>
            <PixInput
              @id="image-name"
              @value={{this.imageName}}
              @requiredLabel={{t "common.forms.mandatory"}}
              placeholder="exemple: clea_num.svg"
              {{on "change" (fn this.updateFormValue "imageName")}}
            >
              <:label>Nom de l'image (svg)</:label>
            </PixInput>
          </div>
          <div class="badge-form__text-field">
            <PixInput
              @id="alt-message"
              @value={{this.badge.altMessage}}
              @requiredLabel={{t "common.forms.mandatory"}}
              {{on "change" (fn this.updateFormValue "altMessage")}}
            >
              <:label>Texte alternatif pour l'image :</:label>
            </PixInput>
          </div>
          <div class="badge-form__text-field">
            <PixTextarea
              @id="message"
              @value={{this.badge.message}}
              rows="4"
              {{on "change" (fn this.updateFormValue "message")}}
            >
              <:label>Message :</:label>
            </PixTextarea>
          </div>
          <div class="badge-form__text-field">
            <PixInput
              @id="badge-key"
              maxlength="255"
              @value={{this.badge.key}}
              @requiredLabel={{t "common.forms.mandatory"}}
              {{on "change" (fn this.updateFormValue "key")}}
            >
              <:label>Clé (texte unique , vérifier qu'il n'existe pas) :</:label>
            </PixInput>
          </div>
          <div class="badge-form__check-field">
            <PixCheckbox
              @checked={{this.badge.isCertifiable}}
              {{on "change" (fn this.updateFormCheckBoxValue "isCertifiable")}}
            >
              <:label>Certifiable</:label>
            </PixCheckbox>
          </div>
          <div class="badge-form__check-field">
            <PixCheckbox
              @checked={{this.badge.isAlwaysVisible}}
              {{on "change" (fn this.updateFormCheckBoxValue "isAlwaysVisible")}}
            >
              <:label>Lacunes</:label>
            </PixCheckbox>
          </div>
        </Card>
        <Criteria @badge={{this.badge}} @areas={{@targetProfile.areas}} />
      </section>
      <section class="admin-form__actions">
        <PixButtonLink @variant="secondary" @route="authenticated.target-profiles.target-profile.insights">
          {{t "common.actions.cancel"}}
        </PixButtonLink>
        <PixButton @variant="success" @type="submit">
          Enregistrer le badge
        </PixButton>
      </section>
    </form>
  </template>
}
