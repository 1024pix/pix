import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
export default class TargetProfileController extends Controller {
  @tracked isEditMode = false;

  get isPublic() {
    return this.model.isPublic ? 'Oui' : 'Non';
  }

  get isOutdated() {
    return this.model.outdated ? 'Oui' : 'Non';
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

}
