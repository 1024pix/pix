import DS from 'ember-data';
import { equal } from '@ember/object/computed';
const { belongsTo, Model, attr } = DS;

export default class OrganizationInvitation extends Model {
  @attr('string') email;
  @attr('string') status;
  @attr('date') updatedAt;
  @attr('string') organizationName;

  @belongsTo('organization') organization;

  @equal('status', 'pending') isPending;
  @equal('status', 'accepted') isAccepted;
}
