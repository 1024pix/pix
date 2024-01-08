import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {
  @service notifications;
  @service store;
  @service router;

  @action
  goToTrainingDetails(trainingId) {
    this.router.transitionTo('authenticated.trainings.training', trainingId);
  }

  @action
  goBackToTrainingList() {
    this.router.transitionTo('authenticated.trainings.list');
  }

  @action
  async createOrUpdateTraining(trainingFormData) {
    try {
      const { id } = await this.store.createRecord('training', trainingFormData).save();
      this.notifications.success('Le contenu formatif a été créé avec succès.');
      this.goToTrainingDetails(id);
    } catch (error) {
      this._handleResponseError(error);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['400', '404', '412', '422'].includes(error.status)) {
        return this.notifications.error(error.detail);
      }
      return this.notifications.error('Une erreur est survenue.');
    });
  }
}
