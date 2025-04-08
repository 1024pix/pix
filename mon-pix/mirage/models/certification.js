import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  resultCompetenceTree: belongsTo(),
  user: belongsTo(),
});
