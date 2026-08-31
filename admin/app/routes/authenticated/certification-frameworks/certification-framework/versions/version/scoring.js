import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScoringRoute extends Route {
  @service store;
  @service router;

  async model() {
    const { activeVersion } = this.modelFor('authenticated.certification-frameworks.certification-framework.versions');

    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    const editVersion = await this.store.findRecord('certification-version', versionId);

    return {
      previousVersion: activeVersion,
      editVersion,
      calibrationScoringConfiguration: await this.loadCalibrationScoringConfiguration(editVersion),
    };
  }

  async loadCalibrationScoringConfiguration(editVersion) {
    if (!editVersion.externalCalibrationId) return null;

    try {
      return await this.store.queryRecord('calibration-scoring-configuration', {
        calibrationId: editVersion.externalCalibrationId,
      });
    } catch {
      return null;
    }
  }

  afterModel(model) {
    if (!model.editVersion.isDraft || !model.calibrationScoringConfiguration?.globalScoringConfiguration?.length) {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting && controller.model.editVersion.hasDirtyAttributes) {
      controller.model.editVersion.rollbackAttributes();
    }
  }
}
