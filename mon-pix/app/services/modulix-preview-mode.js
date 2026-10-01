import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixPreviewModeService extends Service {
  isEnabled = false;
  @tracked isElementsIdButtonEnabled = false;
  @tracked isGrainsTitleButtonEnabled = false;

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  get isPreviewAndElementsIdButtonEnabled() {
    return this.isEnabled && this.isElementsIdButtonEnabled;
  }

  get isPreviewAndGrainsTitleButtonEnabled() {
    return this.isEnabled && this.isGrainsTitleButtonEnabled;
  }

  @action toggleElementIdButton() {
    this.isElementsIdButtonEnabled = !this.isElementsIdButtonEnabled;
  }

  @action toggleGrainsTitleButton() {
    this.isGrainsTitleButtonEnabled = !this.isGrainsTitleButtonEnabled;
  }
}
