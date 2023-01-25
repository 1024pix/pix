import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LearningContent extends Component {
  @service notifications;
  @service store;

  @action
  async refreshLearningContent() {
    try {
      await this.store.adapterFor('learning-content-cache').refreshCacheEntries();
      this.notifications.success('La demande de rechargement du cache a bien été prise en compte.');
    } catch (err) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async createLearningContentReleaseAndRefreshCache() {
    try {
      await this.store.adapterFor('learning-content-cache').createLearningContentReleaseAndRefreshCache();
      this.notifications.success(
        'La création de la version du référentiel et le rechargement du cache a bien été prise en compte.'
      );
    } catch (err) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
