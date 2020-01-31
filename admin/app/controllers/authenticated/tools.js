import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  isLoading: false,

  notifications: service('notification-messages'),

  actions: {
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
});
