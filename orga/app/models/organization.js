import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default class Organization extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') externalId;
  @attr('number') credit;
  @attr('boolean') isManagingStudents;
  @attr('boolean') canCollectProfiles;
  @attr('boolean') isAgriculture;

  @hasMany('campaign') campaigns;
  @hasMany('target-profile') targetProfiles;
  @hasMany('organization-invitation') organizationInvitations;
  @hasMany('student') students;

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
