import DS from 'ember-data';
const { Model, attr } = DS;

export default class Badge extends Model {
  @attr('string') title;
  @attr('string') imageUrl;
}
