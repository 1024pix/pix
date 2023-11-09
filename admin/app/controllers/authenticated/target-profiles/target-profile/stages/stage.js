import difference from 'lodash/difference';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class StageController extends Controller {
  @tracked isEditMode = false;
  @service store;

  get availableLevels() {
    const unavailableLevels = this.model.stageCollection.stages.map((stage) =>
      stage.id === this.model.stage.id ? null : stage.level,
    );
    const allLevels = Array.from({ length: this.model.targetProfile.maxLevel + 1 }, (_, i) => i);
    return difference(allLevels, unavailableLevels);
  }

  get unavailableThresholds() {
    return this.model.stageCollection.stages.map((stage) =>
      this.model.stage.id === stage.id ? null : stage.threshold,
    );
  }

  get hasLinkedCampaign() {
    return this.model.targetProfile.hasLinkedCampaign;
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  async update() {
    await this.store
      .createRecord('stage', this.model.stage)
      .save({ adapterOptions: { stage: this.model.stage, targetProfileId: Number(this.model.targetProfile.id) } });
  }
}
