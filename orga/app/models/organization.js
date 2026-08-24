import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class Organization extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') externalId;
  @attr('number') credit;
  @attr('boolean') isManagingStudents;
  @attr('boolean') isAgriculture;
  @attr('string') documentationUrl;
  @attr('string') identityProviderForCampaigns;
  @attr('string') schoolCode;
  @attr('date') sessionExpirationDate;

  @hasMany('combined-course', { async: true, inverse: null }) combinedCourses;
  @hasMany('campaign', { async: true, inverse: 'organization' }) campaigns;
  @hasMany('target-profile', { async: true, inverse: null }) targetProfiles;
  @hasMany('combined-course-blueprint', { async: true, inverse: null }) combinedCourseBlueprints;
  @hasMany('organization-invitation', { async: true, inverse: 'organization' }) organizationInvitations;
  @hasMany('group', { async: true, inverse: null }) groups;
  @hasMany('organization-learner-filter', { async: true, inverse: null }) learnerFiltersOptions;
  @hasMany('division', { async: true, inverse: null }) divisions;
  @belongsTo('participation-statistic', { async: true, inverse: null }) participationStatistics;

  get hasGarIdentityProvider() {
    return this.isScoAndManagingStudents && this.identityProviderForCampaigns === 'GAR';
  }

  get isPro() {
    return this.type === 'PRO';
  }

  get isSco() {
    return this.type === 'SCO';
  }

  get isScoAndManagingStudents() {
    return this.isSco && this.isManagingStudents;
  }

  get isSco1d() {
    return this.type === 'SCO-1D';
  }

  get isSup() {
    return this.type === 'SUP';
  }
}
