import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationFramework extends Model {
  @attr('string') scope;

  @hasMany('certification-version-summary', { async: false, inverse: null }) versionSummaries;
  @hasMany('certification-target-profile-summary', { async: false, inverse: null }) targetProfileSummaries;

  get activeVersionStartDate() {
    return this.versionSummaries.find((versionSummary) => versionSummary.isActive)?.startDate ?? null;
  }

  get activeVersionId() {
    return this.versionSummaries.find((versionSummary) => versionSummary.isActive)?.id ?? null;
  }

  get hasDraft() {
    return this.versionSummaries.some((versionSummary) => versionSummary.isDraft);
  }

  get hasTargetProfilesHistory() {
    return this.targetProfileSummaries.length > 0;
  }

  get activeTargetProfileSummary() {
    return this.targetProfileSummaries.find((targetProfileSummary) => !targetProfileSummary.detachedAt) ?? null;
  }
}
