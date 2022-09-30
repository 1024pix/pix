import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const LEVEL_COLUMN_NAME = 'Niveau';
const THRESHOLD_COLUMN_NAME = 'Seuil';

export default class Stages extends Component {
  @service store;
  @service notifications;

  get isTypeLevel() {
    return this.args.firstObject?.isTypeLevel ?? false;
  }

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

  get columnNameByStageType() {
    return this.isTypeLevel ? LEVEL_COLUMN_NAME : THRESHOLD_COLUMN_NAME;
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
  removeStage(stage) {
    stage.deleteRecord();
  }

  @action
  cancelStagesCreation() {
    this.newStages.forEach((stage) => stage.deleteRecord());
  }
}
