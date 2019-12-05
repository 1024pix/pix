import DS from 'ember-data';
const { attr, belongsTo, Model } = DS;
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
