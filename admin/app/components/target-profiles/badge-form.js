import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
  };

  imageName = '';
  threshold = null;

  constructor(...args) {
    super(...args);
  }

  @action
  async createBadgeAndCriteria(event) {
    event.preventDefault();
    try {
      const badge = await this._createBadge();

      if (this.threshold) {
        await this._createThresholdBadgeCriterion(badge);
      }

      this.router.transitionTo('authenticated.target-profiles.target-profile.insights');
    } catch (error) {
      console.error(error);
    }
  }

  async _createBadge() {
    try {
      const badgeWithFormattedImageUrl = {
        ...this.badge,
        imageUrl: this.BASE_URL + this.imageName,
      };
      const badge = this.store.createRecord('badge', badgeWithFormattedImageUrl);
      await badge.save({
        adapterOptions: { targetProfileId: this.args.targetProfileId },
      });

      this.notifications.success('Le résultat thématique a été créé.');
      return badge;
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la création du résultat thématique.');
    }
  }

  async _createThresholdBadgeCriterion(badge) {
    try {
      if (this.threshold < 0 || this.threshold > 100) {
        this.notifications.error('Le taux de réussite doit être compris entre 0 et 100.');
        return;
      }
      const badgeCriterion = this.store.createRecord('badge-criterion', {
        scope: 'CampaignParticipation',
        threshold: this.threshold,
        badge,
      });
      await badgeCriterion.save();
      this.notifications.success('Le critère du résultat thématique a été créé.');
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la création du critère du résultat thématique.');
    }
  }
}
