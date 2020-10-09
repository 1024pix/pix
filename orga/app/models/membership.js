import DS from 'ember-data';
const { belongsTo, Model, attr } = DS;

const organizationRoleToDisplayRole = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default class Membership extends Model {
  @belongsTo('user') user;
  @belongsTo('organization') organization;
  @attr('string') organizationRole;

  get isAdmin() {
    return this.organizationRole === 'ADMIN';
  }

  get displayRole() {
    return organizationRoleToDisplayRole[this.organizationRole];
  }
}
