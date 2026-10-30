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
    const previousVersion = await this.#resolvePreviousVersion(editVersion, activeVersion, certificationFramework);

    return {
      previousVersion,
      editVersion,
      calibrationScoringConfiguration: await this.loadCalibrationScoringConfiguration(editVersion, previousVersion),
    };
  }

  async #resolvePreviousVersion(editVersion, activeVersion, certificationFramework) {
    if (editVersion.isDraft) return activeVersion;

    const mostRecentArchived = certificationFramework.versionSummaries
      .filter((s) => s.isArchived)
      .sort((a, b) => b.expirationDate - a.expirationDate)[0];

    return mostRecentArchived ? this.store.findRecord('certification-version', mostRecentArchived.id) : null;
  }

  async loadCalibrationScoringConfiguration(editVersion, previousVersion) {
    if (!editVersion.externalCalibrationId) return null;

    try {
      const calibrationScoringConfiguration = await this.store.queryRecord('calibration-scoring-configuration', {
        calibrationId: editVersion.externalCalibrationId,
      });
      if (!editVersion.isCoreScope && calibrationScoringConfiguration.globalScoringConfiguration.length === 0) {
        calibrationScoringConfiguration.globalScoringConfiguration = structuredClone(
          previousVersion.globalScoringConfiguration,
        );
      }
      return calibrationScoringConfiguration;
    } catch {
      return null;
    }
  }

  afterModel(model) {
    const { editVersion, calibrationScoringConfiguration } = model;
    if (editVersion.isArchived) {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    }

    let canAccessScoring;
    if (editVersion.isCoreScope) {
      const attachedCalibrationHasScoringConfig =
        calibrationScoringConfiguration?.globalScoringConfiguration?.length > 0;
      canAccessScoring = editVersion.isDraft && attachedCalibrationHasScoringConfig;
    } else {
      const hasNoScoringConfigYet = !editVersion.globalScoringConfiguration?.length;
      console.log(calibrationScoringConfiguration);
      canAccessScoring = hasNoScoringConfigYet && !!calibrationScoringConfiguration;
    }

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
