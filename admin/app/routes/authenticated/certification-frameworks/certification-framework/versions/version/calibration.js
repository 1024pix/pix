import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkEditRoute extends Route {
  @service store;
  @service router;
  @service pixToast;

  async model() {
    const { activeVersion } = this.modelFor('authenticated.certification-frameworks.certification-framework.versions');

    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    const draftVersion = await this.store.findRecord('certification-version', versionId);

    return {
      activeVersion,
      draftVersion,
      calibrationReport: await this.loadCalibrationReport(draftVersion),
    };
  }

  async loadCalibrationReport(draftVersion) {
    try {
      return await this.store.queryRecord('calibration-report', { versionId: draftVersion.id });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: error.errors?.[0].detail });
      return null;
    }
  }

  afterModel(model) {
    if (!model.draftVersion.isDraft) {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting && controller.model.draftVersion.hasDirtyAttributes) {
      controller.model.draftVersion.rollbackAttributes();
    }
  }
}
