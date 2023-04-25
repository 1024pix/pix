import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled;
  @attr('boolean') isMassiveSessionManagementEnabled;
  @attr('boolean') isDifferentiatedTimeInvigilatorPortalEnabled;
}
