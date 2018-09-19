import DS from 'ember-data';

export default DS.Model.extend({
  isShared: DS.attr('boolean')
});
