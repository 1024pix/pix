import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CalibrationController extends Controller {
  @controller('authenticated.certification-frameworks.certification-framework.versions.version')
  versionController;
  @tracked isConfirmationModalOpen = false;

  @action
  toggleConfirmationModal() {
    this.isConfirmationModalOpen = !this.isConfirmationModalOpen;
  }

  get hasNoExternalCalibrationId() {
    return !this.model.draftVersion.externalCalibrationId;
  }

  get isPixPlusScope() {
    return this.model.draftVersion.scope !== 'CORE';
  }

  @action
  activateVersion() {
    return this.versionController.activateVersion(this.model.draftVersion, this.model.calibrationScoringConfiguration);
  }
}
