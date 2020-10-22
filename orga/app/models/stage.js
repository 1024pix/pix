import DS from 'ember-data';
const { Model, attr } = DS;

export default class Stage extends Model {
  @attr('string') message;
  @attr('string') title;
  @attr('number') threshold;
}
