import DS from 'ember-data';
import { computed } from '@ember/object';

const organizationRoleToDisplayRole = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default DS.Model.extend({
  user: DS.belongsTo('user'),
  organization: DS.belongsTo('organization'),
  organizationRole: DS.attr('string'),

  isAdmin: computed.equal('organizationRole', 'ADMIN'),

  displayRole: computed('organizationRole', function() {
    return organizationRoleToDisplayRole[this.organizationRole];
  }),
});
