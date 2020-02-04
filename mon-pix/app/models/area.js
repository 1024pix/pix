import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  title: attr('string'),
  competences: hasMany('competence'),
  resultCompetences: hasMany('resultCompetence'),
  code: attr('number'),
  color: attr('string'),
});
