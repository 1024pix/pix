import Model, { belongsTo, attr } from '@ember-data/model';
import { equal } from '@ember/object/computed';

export default class OrganizationInvitation extends Model {

  @attr email;
  @attr status;
  @attr createdAt;
  @attr organizationName;

  @belongsTo('organization') organization;

  @equal('status', 'pending') isPending;
  @equal('status', 'accepted') isAccepted;
}
