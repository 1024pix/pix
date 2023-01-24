import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class AdministrationController extends Controller {
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
