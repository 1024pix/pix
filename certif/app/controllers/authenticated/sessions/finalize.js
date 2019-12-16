import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import config from '../../../config/environment';

export default Controller.extend({
  isLoading: false,
  notifications: service('notification-messages'),

  showConfirmModal: false,

  showErrorNotification(message) {
    const { autoClear, clearDuration } = config.notifications;
    this.get('notifications').error(message, { autoClear, clearDuration });
  },

  showSuccessNotification(message) {
    const { autoClear, clearDuration } = config.notifications;
    this.get('notifications').success(message, { autoClear, clearDuration });
  },

  actions: {
    finalizeSession() {
      this.set('isLoading', true);

      return this.model
        .finalize()
        .then(() => {
          this.showSuccessNotification('Les informations de la session ont été transmises avec succès.');
        })
        .catch((err) => {
          (err.errors && err.errors[0] && err.errors[0].status === '400')
            ? this.showErrorNotification('Cette session a déjà été finalisée.')
            : this.showErrorNotification('Erreur lors de la finalisation de session.');
        })
        .finally(() => {
          this.set('isLoading', false);
          this.set('showConfirmModal', false);
          this.transitionToRoute('authenticated.sessions.details', this.model.id);
        });
    },

    openModal() {
      this.set('showConfirmModal', true);
    },

    closeModal() {
      this.set('showConfirmModal', false);
    },
  },

});
