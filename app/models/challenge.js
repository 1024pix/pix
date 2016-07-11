import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({

  type: attr('string'),
  status: attr('string'),
  statement: belongsTo('statement')



});
