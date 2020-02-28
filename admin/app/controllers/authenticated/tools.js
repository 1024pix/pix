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
      this.notifications.success('Le cache a été rechargé avec succès.');
    } catch (err) {
      this.notifications.error('Une erreur est survenue.');
    } finally {
      this.set('isLoading', false);
    }
  }
}
