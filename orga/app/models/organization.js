import Model, { hasMany, attr } from '@ember-data/model';

export default class Organization extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') externalId;
  @attr('number') credit;
  @attr('boolean') isManagingStudents;
  @attr('boolean') canCollectProfiles;
  @attr('boolean') isAgriculture;
  @attr('boolean') isAEFE;
  @attr('boolean') isMLF;
  @attr('boolean') isMediationNumerique;

  @hasMany('campaign') campaigns;
  @hasMany('target-profile') targetProfiles;
  @hasMany('organization-invitation') organizationInvitations;
  @hasMany('student') students;
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

  get pendingOrganizationInvitationsCount() {
    return this.organizationInvitations.filterBy('isPending').length;
  }
}
