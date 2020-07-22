import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
const { belongsTo, Model, attr } = DS;

const organizationRoleToDisplayRole = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default class Membership extends Model {
  @belongsTo('user') user;
  @belongsTo('organization') organization;
  @attr('string') organizationRole;

  @equal('organizationRole', 'ADMIN') isAdmin;

  @computed('organizationRole')
  get displayRole() {
    return organizationRoleToDisplayRole[this.organizationRole];
  }
}
