import DS from 'ember-data';

export default DS.Model.extend({
  campaignCompetenceCollectiveResults: DS.hasMany('campaignCompetenceCollectiveResult')
});
