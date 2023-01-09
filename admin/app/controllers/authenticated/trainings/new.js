import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {
  @service notifications;
  @service store;
  @service router;

  @action
  goBackToTrainingList() {
    this.router.transitionTo('authenticated.trainings.list');
  }

  @action
  async createOrUpdateTraining(trainingFormData) {
    try {
      await this.store.createRecord('training', trainingFormData).save();
      this.notifications.success('Le contenu formatif a été créé avec succès.');
      this.goBackToTrainingList();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
