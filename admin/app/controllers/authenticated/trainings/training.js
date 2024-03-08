import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Training extends Controller {
  @service notifications;
  @service accessControl;

  @tracked isEditMode = false;

  get canEdit() {
    return this.accessControl.hasAccessToTrainingsActionsScope;
  }

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
