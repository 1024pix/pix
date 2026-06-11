import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TrainingEditTriggersController extends Controller {
  @service intl;
  @service router;
  @service store;
  @service pixToast;

  queryParams = ['type'];

  @tracked type = null;
  @tracked submitting = false;

  get thresholdTitle() {
    return this.intl.t(`pages.trainings.training.triggers.${this.type}.title`);
  }

  get thresholdDescription() {
    return this.intl.t(`pages.trainings.training.triggers.${this.type}.edit.description`);
  }

  @action
  updateTubes(tubesWithLevel) {
    this.selectedTubes = tubesWithLevel.map(({ id, level }) => ({
      id,
      level,
    }));
  }

  @action
  goBackToTraining() {
    this.router.transitionTo('authenticated.trainings.training.triggers');
  }

  @action
  async onSubmit(event) {
    event.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(event.target).entries());
      await this.store
        .createRecord('training-trigger', { ...data, type: this.type, training: this.model.training })
        .save({ adapterOptions: { tubes: this.selectedTubes, trainingId: this.model.training.id } });
      this.pixToast.sendSuccessNotification({ message: 'Le déclencheur a été créé avec succès.' });
      this.goBackToTraining();
    } catch {
      this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
    }
  }

  @action
  onCancel() {
    this.goBackToTraining();
  }
}
