import DS from 'ember-data';
const { belongsTo, Model, attr } = DS;

export default class OrganizationInvitation extends Model {
  @attr('string') email;
  @attr('string') status;
  @attr('date') updatedAt;
  @attr('string') organizationName;

  @belongsTo('organization') organization;

  get isPending() {
    return this.status === 'pending';
  }

  get isAccepted() {
    return this.status === 'accepted';
  }
}
