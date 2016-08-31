import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import attr from 'ember-data/attr';

export default Model.extend({
  id: attr('string'),
  createdTime: attr('string'),
  fields: {}
});
