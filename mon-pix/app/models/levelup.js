import DS from 'ember-data';

export default DS.Model.extend({
  competenceName: DS.attr(),
  level: DS.attr(),
});
