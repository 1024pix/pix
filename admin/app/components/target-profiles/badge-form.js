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
    campaignThreshold: null,
    skillSetThreshold: null,
    skillSetName: '',
  };

  imageName = '';

  skillSetSkills = '';

  constructor(...args) {
    super(...args);
  }

  @action
  async createBadgeAndCriteria(event) {
    event.preventDefault();
    try {
      await this._createBadge();
    } catch (error) {
      console.error(error);
    }
  }

  async _createBadge() {
    try {
      const badgeWithFormattedImageUrl = {
        ...this.badge,
        imageUrl: this.BASE_URL + this.imageName,
        skillSetSkillsIds: this._skillIds,
      };
      const badge = this.store.createRecord('badge', badgeWithFormattedImageUrl);

      await badge.save({
        adapterOptions: { targetProfileId: this.args.targetProfileId },
      });

      this.notifications.success('Le résultat thématique a été créé.');
      this.router.transitionTo('authenticated.target-profiles.target-profile.insights');
      return badge;
    } catch (error) {
      console.error(error);
      this.notifications.error(`${error.errors[0].detail}`);
    }
  }

  get _skillIds() {
    const skillIds = this.skillSetSkills.replace(/\s/g, '');
    if (skillIds === '') return null;
    return skillIds.split(',');
  }
}
