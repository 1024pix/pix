import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ToolsController extends Controller {

  isLoading = false;

  @service notifications;

  @action
  async refreshLearningContent() {
    this.set('isLoading', true);
    try {
      await this.store.adapterFor('learning-content-cache').refreshCacheEntries();
      this.notifications.success('La demande de rechargement du cache a bien été prise en compte.');
    } catch (err) {
      this.notifications.error('Une erreur est survenue.');
    } finally {
      this.set('isLoading', false);
    }
  }
}
