import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class BadgeForm extends Component {
  @service notifications;
  @service store;
  @service router;

  badge = {
    key: '',
    altMessage: '',
    imageUrl: '',
    message: '',
    title: '',
    isCertifiable: false,
    isAlwaysVisible: false,
  };
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
        await this._createThresholdBadgeCriterion(badge.id);
      }

      this.notifications.success('Le badge est créé.');
      this.router.transitionTo('authenticated.target-profiles.target-profile.insights');
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la création du résultat thématique.');
    }
  }

  async _createBadge() {
    const badge = this.store.createRecord('badge', this.badge);
    await badge.save({
      adapterOptions: { targetProfileId: this.args.targetProfileId },
    });

    return badge;
  }

  async _createThresholdBadgeCriterion(badgeId) {
    try {
      if (this.threshold < 0 || this.threshold > 100) {
        this.notifications.error('Le taux de réussite doit être compris entre 0 et 100.');
        return;
      }
      const badgeCriterion = this.store.createRecord('badge-criterion', {
        scope: 'CampaignParticipation',
        threshold: this.threshold,
      });
      await badgeCriterion.save({ adapterOptions: { badgeId } });
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la création du critère du résultat thématique.');
    }
  }
}
