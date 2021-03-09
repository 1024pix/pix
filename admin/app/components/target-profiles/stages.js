import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Stages extends Component {
  @service store;
  @service notifications;

  get hasStages() {
    const stages = this.args.stages;
    return stages && stages.length > 0;
  }

  get hasNewStage() {
    return this.args.stages.any((stage) => stage.isNew);
  }

  get newStages() {
    return this.args.stages.filter((stage) => stage.isNew);
  }

  get displayNoThresholdZero() {
    return this.hasStages && !this.args.stages.any((stage) => stage.threshold === 0);
  }

  @action
  addStage() {
    this.store.createRecord('stage', { targetProfile: this.args.targetProfile });
  }

  @action
  async createStages(event) {
    event.preventDefault();

    try {
      await Promise.all(this.newStages.map((stage) => stage.save()));
    } catch (_error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  removeNewStage(stage) {
    stage.deleteRecord();
  }

  @action
  cancelStagesCreation() {
    this.newStages.forEach((stage) => stage.deleteRecord());
  }
}
