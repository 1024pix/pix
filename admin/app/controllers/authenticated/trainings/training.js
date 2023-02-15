import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class Training extends Controller {
  @service notifications;

  @tracked isEditMode = false;

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  async updateTraining(trainingFormData) {
    try {
      for (const key in trainingFormData) {
        this.model[key] = trainingFormData[key];
      }
      await this.model.save();
      this.notifications.success('Le contenu formatif a été mis à jour avec succès.');
      this.toggleEditMode();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
