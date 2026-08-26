import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ScoringController extends Controller {
  @controller('authenticated.certification-frameworks.certification-framework.versions.version')
  versionController;
  @tracked isConfirmationModalOpen = false;

  @action
  toggleConfirmationModal() {
    this.isConfirmationModalOpen = !this.isConfirmationModalOpen;
  }

  @action
  activateVersion() {
    return this.versionController.activateVersion(this.model.draftVersion, this.model.calibrationScoringConfiguration);
  }
}
