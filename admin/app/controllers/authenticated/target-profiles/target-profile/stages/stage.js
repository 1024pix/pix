import difference from 'lodash/difference';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class StageController extends Controller {
  @tracked isEditMode = false;

  get availableLevels() {
    const unavailableLevels = this.model.targetProfile.stages.map((stage) =>
      stage.id === this.model.stage.id ? null : stage.level
    );
    const allLevels = Array.from({ length: this.model.targetProfile.maxLevel }, (_, i) => i + 1);
    return difference(allLevels, unavailableLevels);
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
}
