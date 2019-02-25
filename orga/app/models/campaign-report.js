import DS from 'ember-data';

export default DS.Model.extend({
  participationsCount: DS.attr(),
  sharedParticipationsCount: DS.attr(),
});
