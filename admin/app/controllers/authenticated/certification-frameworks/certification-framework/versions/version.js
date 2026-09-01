import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class VersionController extends Controller {
  @service pixToast;
  @service intl;
  @service router;
  @service store;

  @action
  async saveScoring(version, calibrationScoringConfiguration) {
    version.globalScoringConfiguration = version.globalScoringConfiguration?.length
      ? [...version.globalScoringConfiguration]
      : (calibrationScoringConfiguration?.globalScoringConfiguration ?? []);
    version.competencesScoringConfiguration = calibrationScoringConfiguration?.competencesScoringConfiguration ?? [];
    await version.save({ adapterOptions: { saveScoring: true } });
  }

  @action
  async activateVersion(draftVersion) {
    try {
      await draftVersion.save({ adapterOptions: { activate: true } });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.activate-version.success',
          { versionId: draftVersion.id },
        ),
      });
      await this.store.findAll('certification-framework', { reload: true });
      await this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.activate-version.error',
          { versionId: draftVersion.id },
        ),
      });
    }
  }
}
