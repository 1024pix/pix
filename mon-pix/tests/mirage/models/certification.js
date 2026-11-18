import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  resultCompetenceTree: belongsTo('resultCompetenceTree', { inverse: null }),
  user: belongsTo('user', { inverse: 'certifications' }),
});
