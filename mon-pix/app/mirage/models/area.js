import { hasMany, Model } from 'miragejs';

export default Model.extend({
  resultCompetences: hasMany(),
  competences: hasMany(),
});
