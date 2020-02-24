import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

const displayedOrganizationRoles = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default Model.extend({

  // Attributes
  organizationRole: attr(),

  displayedOrganizationRole: computed('organizationRole', function() {
    return displayedOrganizationRoles[this.organizationRole];
  }),

  // Relationships
  organization: belongsTo('organization'),
  user: belongsTo('user'),
});
