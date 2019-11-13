import DS from 'ember-data';
import { computed } from '@ember/object';

const { attr, belongsTo } = DS;

const displayedOrganizationRoles = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default DS.Model.extend({

  // Attributes
  organizationRole: attr(),

  displayedOrganizationRole: computed('organizationRole', function() {
    return displayedOrganizationRoles[this.organizationRole];
  }),

  // Relationships
  organization: belongsTo('organization'),
  user: belongsTo('user'),
});
