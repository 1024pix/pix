import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class NewController extends Controller {
  @service notifications;
  @service store;
  @service router;

  @action
  goToTrainingDetails(trainingId) {
    this.router.transitionTo('authenticated.trainings.training', trainingId);
  }

  @action
  async createOrUpdateTraining(trainingFormData) {
    try {
      const { id } = await this.store.createRecord('training', trainingFormData).save();
      this.notifications.success('Le contenu formatif a été créé avec succès.');
      this.goToTrainingDetails(id);
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
