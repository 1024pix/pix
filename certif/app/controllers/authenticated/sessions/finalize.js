import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import config from '../../../config/environment';

export default class AuthenticatedSessionsFinalizeController extends Controller {
  @service notifications;
  @tracked isLoading;
  @tracked showConfirmModal;

  constructor() {
    super(...arguments);

    this.isLoading = false;
    this.showConfirmModal = false;
  }

  showErrorNotification(message) {
    const { autoClear, clearDuration } = config.notifications;
    this.notifications.error(message, { autoClear, clearDuration });
  }

  showSuccessNotification(message) {
    const { autoClear, clearDuration } = config.notifications;
    this.notifications.success(message, { autoClear, clearDuration });
  }

  @action
  async finalizeSession() {
    this.isLoading = true;

    try {
      await this.model.finalize();
      this.showSuccessNotification('Les informations de la session ont été transmises avec succès.');
    } catch (err) {
      (err.errors && err.errors[0] && err.errors[0].status === '400')
        ? this.showErrorNotification('Cette session a déjà été finalisée.')
        : this.showErrorNotification('Erreur lors de la finalisation de session.');
    }
    this.isLoading = false;
    this.showConfirmModal = false;
    this.transitionToRoute('authenticated.sessions.details', this.model.id);
  }

  @action
  openModal() {
    this.showConfirmModal = true;
  }

  @action
  closeModal() {
    this.showConfirmModal = false;
  }
}
