import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixPreviewModeService extends Service {
  isEnabled = false;
  @tracked displayElementIdsButton = false;

  enable() {
    this.isEnabled = true;
  }

  get isElementIdsButtonEnabled() {
    return this.isEnabled === true && this.displayElementIdsButton === true;
  }

  @action enableElementIdsButton() {
    this.displayElementIdsButton = !this.displayElementIdsButton;
  }
}
