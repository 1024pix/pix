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

  constructor(...args) {
    super(...args);
  }

  @action
  async createBadge(event) {
    event.preventDefault();
    try {
      const result = await this.store.createRecord('badge', this.badge);
      await result.save({ adapterOptions: { targetProfileId: this.args.targetProfileId } });
      this.notifications.success('Le badge est créé.');
      this.router.transitionTo('authenticated.target-profiles.target-profile.insights');
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la création du badge.');
    }
  }
}
