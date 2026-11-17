import { hasMany, Model } from 'miragejs';

export default Model.extend({
  resultCompetences: hasMany('resultCompetence', { inverse: 'area' }),
  competences: hasMany('competence', { inverse: 'area' }),
});
