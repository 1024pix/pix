import DS from 'ember-data';
import { computed } from '@ember/object';

const { attr, hasMany } = DS;

const displayedNames = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default DS.Model.extend({

  // Attributes
  name: attr(),

  displayedName: computed('name', function() {
    return displayedNames[this.name];
  }),

  // Relationships
  membership: hasMany('membership'),

});
