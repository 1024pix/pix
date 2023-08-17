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

  @hasMany('campaign') campaigns;
  @hasMany('target-profile') targetProfiles;
  @hasMany('organization-invitation') organizationInvitations;
  @hasMany('group') groups;
  @hasMany('division') divisions;

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
