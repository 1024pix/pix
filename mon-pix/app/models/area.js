import DS from 'ember-data';

const { attr, Model, hasMany } = DS;

export default Model.extend({
  name: attr('string'),
  title: attr('string'),
  competences: hasMany('competence'),
  resultCompetences: hasMany('resultCompetence'),
  code: attr('number'),
  color: attr('string'),
});
