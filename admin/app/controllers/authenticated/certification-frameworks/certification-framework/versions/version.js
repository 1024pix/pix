import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class VersionController extends Controller {
  @service pixToast;
  @service intl;
  @service router;
  @service store;

  @action
  async activateVersion(draftVersion, calibrationScoringConfiguration) {
    try {
      draftVersion.globalScoringConfiguration = draftVersion.globalScoringConfiguration?.length
        ? [...draftVersion.globalScoringConfiguration]
        : (calibrationScoringConfiguration?.globalScoringConfiguration ?? []);
      draftVersion.competencesScoringConfiguration =
        calibrationScoringConfiguration?.competencesScoringConfiguration ?? [];
      await draftVersion.save();
      await draftVersion.save({ adapterOptions: { activate: true } });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.activate-version.success',
          {
            versionId: draftVersion.id,
          },
        ),
      });
      await this.store.findAll('certification-framework', { reload: true });
      await this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.activate-version.error',
          {
            versionId: draftVersion.id,
          },
        ),
      });
    }
  }
}
