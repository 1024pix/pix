import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ScoringController extends Controller {
  @controller('authenticated.certification-frameworks.certification-framework.versions.version')
  versionController;
  @tracked isActivationModalOpen = false;

  @action
  toggleActivationModal() {
    this.isActivationModalOpen = !this.isActivationModalOpen;
  }

  get hasGlobalScoringError() {
    const editVersion = this.model.editVersion;
    const config = editVersion.globalScoringConfiguration?.length
      ? editVersion.globalScoringConfiguration
      : (this.model.calibrationScoringConfiguration?.globalScoringConfiguration ?? []);
    return config.some(({ bounds }) => bounds.max <= bounds.min);
  }

  @action
  activateVersion() {
    return this.versionController.activateVersion(this.model.editVersion);
  }
}
