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
    const draftVersion = await this.store.findRecord('certification-version', versionId);

    return {
      activeVersion,
      draftVersion,
      calibrationScoringConfiguration: await this.loadCalibrationScoringConfiguration(draftVersion),
    };
  }

  async loadCalibrationScoringConfiguration(draftVersion) {
    if (!draftVersion.externalCalibrationId) return null;

    try {
      return await this.store.queryRecord('calibration-scoring-configuration', {
        calibrationId: draftVersion.externalCalibrationId,
      });
    } catch {
      return null;
    }
  }

  afterModel(model) {
    if (!model.draftVersion.isDraft || !model.calibrationScoringConfiguration?.globalScoringConfiguration?.length) {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting && controller.model.draftVersion.hasDirtyAttributes) {
      controller.model.draftVersion.rollbackAttributes();
    }
  }
}
