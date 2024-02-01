import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class BadgeForm extends Component {
  @service notifications;
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
      return this.notifications.error("Vous devez sélectionner au moins un critère d'obtention de résultat thématique");
    }

    const hasSelectedCappedTubes = this.badge.cappedTubesCriteria[0]?.cappedTubes?.length;

    if (hasCappedTubesCriteria && !hasSelectedCappedTubes) {
      return this.notifications.error('Vous devez sélectionner au moins un sujet du profil cible');
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

      this.notifications.success('Le résultat thématique a été créé.');
      this.router.transitionTo('authenticated.target-profiles.target-profile.insights');
      return badge;
    } catch (error) {
      console.error(error);
      this.notifications.error(`${error.errors[0].detail}`);
    }
  }
}
