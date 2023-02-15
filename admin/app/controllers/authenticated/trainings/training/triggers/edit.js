import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class TrainingEditTriggersController extends Controller {
  @service intl;
  @service router;
  @service store;
  @service notifications;

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
    this.router.transitionTo('authenticated.trainings.training');
  }

  @action
  async onSubmit(event) {
    event.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(event.target).entries());
      await this.store.createRecord('training-trigger', data).save();
      this.notifications.success('Le déclencheur a été créé avec succès.');
      this.goBackToTraining();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  onCancel() {
    this.goBackToTraining();
  }
}
