import DS from 'ember-data';
import { computed } from '@ember/object';

const { attr, hasMany } = DS;

const nameToDisplayName = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default DS.Model.extend({

  // Attributes
  name: attr(),

  displayName: computed('name', function() {
    return nameToDisplayName[this.name];
  }),

  // Relationships
  membership: hasMany('membership'),

});
