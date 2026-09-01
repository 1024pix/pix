import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScoringRoute extends Route {
  @service store;
  @service router;

  async model() {
    const { activeVersion, certificationFramework } = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.versions',
    );

    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    const editVersion = await this.store.findRecord('certification-version', versionId);

    return {
      previousVersion: await this.#resolvePreviousVersion(editVersion, activeVersion, certificationFramework),
      editVersion,
      calibrationScoringConfiguration: await this.loadCalibrationScoringConfiguration(editVersion),
    };
  }

  async #resolvePreviousVersion(editVersion, activeVersion, certificationFramework) {
    if (editVersion.isDraft) return activeVersion;

    const mostRecentArchived = certificationFramework.versionSummaries
      .filter((s) => s.isArchived)
      .sort((a, b) => b.expirationDate - a.expirationDate)[0];

    return mostRecentArchived ? this.store.findRecord('certification-version', mostRecentArchived.id) : null;
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
    const { editVersion, calibrationScoringConfiguration } = model;
    const hasCalibrationScoring = calibrationScoringConfiguration?.globalScoringConfiguration?.length;
    const canAccessScoring =
      (editVersion.isDraft && hasCalibrationScoring) || (editVersion.isActive && !editVersion.isCoreScope);

    if (!canAccessScoring) {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.isActivationModalOpen = false;
      controller.isSaveScoringModalOpen = false;
      if (controller.model.editVersion.hasDirtyAttributes) {
        controller.model.editVersion.rollbackAttributes();
      }
    }
  }
}
