import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class StageController extends Controller {
  @tracked isEditMode = false;

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
}
