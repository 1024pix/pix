import Model, { belongsTo, attr } from '@ember-data/model';

export default class Membership extends Model {
  @belongsTo('user') user;
  @belongsTo('organization') organization;
  @attr('string') organizationRole;

  get isAdmin() {
    return this.organizationRole === 'ADMIN';
  }
}
