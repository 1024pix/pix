import Model, { attr, hasMany } from '@ember-data/model';

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

  @hasMany('campaign', { async: true, inverse: 'organization' }) campaigns;
  @hasMany('target-profile', { async: true, inverse: null }) targetProfiles;
  @hasMany('organization-invitation', { async: true, inverse: 'organization' }) organizationInvitations;
  @hasMany('group', { async: true, inverse: null }) groups;
  @hasMany('division', { async: true, inverse: null }) divisions;

  get isSco1d() {
    return this.type === 'SCO-1D';
  }

  get isSco() {
    return this.type === 'SCO';
  }

  get isSup() {
    return this.type === 'SUP';
  }

  get isPro() {
    return this.type === 'PRO';
  }
}
