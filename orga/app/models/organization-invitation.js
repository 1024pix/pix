import Model, { attr, belongsTo } from '@ember-data/model';

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
