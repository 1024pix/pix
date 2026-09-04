import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ScoringController extends Controller {
  @controller('authenticated.certification-frameworks.certification-framework.versions.version')
  versionController;
  @service pixToast;
  @service intl;
  @service router;
  @service store;
  @tracked isActivationModalOpen = false;
  @tracked isSaveScoringModalOpen = false;

  @action
  toggleActivationModal() {
    this.isActivationModalOpen = !this.isActivationModalOpen;
  }

  @action
  toggleSaveScoringModal() {
    this.isSaveScoringModalOpen = !this.isSaveScoringModalOpen;
  }

  get hasGlobalScoringError() {
    const editVersion = this.model.editVersion;
    const config = editVersion.globalScoringConfiguration?.length
      ? editVersion.globalScoringConfiguration
      : (this.model.calibrationScoringConfiguration?.globalScoringConfiguration ?? []);
    return config.some(({ bounds }) => bounds.max <= bounds.min);
  }

  @action
  async saveScoring() {
    try {
      await this.versionController.saveScoring(this.model.editVersion, this.model.calibrationScoringConfiguration);
      this.isSaveScoringModalOpen = false;
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.scoring.success-notification',
        ),
      });
      await this.store.findAll('certification-framework', { reload: true });
      await this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certification-frameworks.certification-framework.versions.scoring.save-error'),
      });
    }
  }

  @action
  async saveScoringAndActivate() {
    try {
      await this.versionController.saveScoring(this.model.editVersion, this.model.calibrationScoringConfiguration);
      await this.versionController.activateVersion(this.model.editVersion);
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certification-frameworks.certification-framework.versions.scoring.save-error'),
      });
    }
  }
}
