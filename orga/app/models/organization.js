import { equal } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default class Organization extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') externalId;
  @attr('boolean') isManagingStudents;
  @attr('boolean') canCollectProfiles;

  @hasMany('campaign') campaigns;
  @hasMany('target-profile') targetProfiles;
  @hasMany('membership') memberships;
  @hasMany('organization-invitation') organizationInvitations;
  @hasMany('student') students;

  @equal('type', 'SCO') isSco;
  @equal('type', 'PRO') isPro;
}
