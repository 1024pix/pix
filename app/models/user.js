import DS from 'ember-data';

const { attr } = DS;

export default DS.Model.extend({
  firstName: attr(),
  lastName: attr(),
  email: attr(),
  password: attr(),
});
