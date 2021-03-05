import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Stages extends Component {
  @service store;

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

  @action
  addStage() {
    this.store.createRecord('stage', { targetProfile: this.args.targetProfile });
  }

  @action
  async createStages(event) {
    event.preventDefault();
    await Promise.all(this.newStages.map((stage) => stage.save()));
  }

  @action
  cancelStagesCreation() {
    this.newStages.forEach((stage) => stage.deleteRecord());
  }
}
