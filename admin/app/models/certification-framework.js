import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class CertificationFramework extends Model {
  @attr('string') scope;

  @hasMany('certification-version-summary', { async: false, inverse: null }) versionSummaries;
  @belongsTo('complementary-certification', { async: true, inverse: null }) complementaryCertification;

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
    return this.belongsTo('complementaryCertification').id() !== null;
  }

  get currentTargetProfiles() {
    return this.complementaryCertification?.currentTargetProfiles ?? null;
  }
}
