import Model, { belongsTo, attr } from '@ember-data/model';

export default class Membership extends Model {
  @attr('string') organizationRole;

  @belongsTo('user', { async: true, inverse: 'memberships' }) user;
  @belongsTo('organization', { async: true, inverse: null }) organization;

  get isAdmin() {
    return this.organizationRole === 'ADMIN';
  }
}
