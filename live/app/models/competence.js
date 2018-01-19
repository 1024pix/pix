import { alias } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  area: belongsTo('area', { inverse: null }),
  user: belongsTo('user'),
  index: attr('number'),
  level: attr('number'),
  areaName: alias('area.name'),
  courseId: attr('string'),
  assessmentId: attr('string'),
  status: attr('string')
});
