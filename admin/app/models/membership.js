import { computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

const displayedOrganizationRoles = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default class Membership extends Model {

  @attr() organizationRole;

  @computed('organizationRole')
  get displayedOrganizationRole() {
    return displayedOrganizationRoles[this.organizationRole];
  }

  @belongsTo('organization') organization;
  @belongsTo('user') user;
}
