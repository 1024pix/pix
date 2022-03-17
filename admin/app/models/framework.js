import Model, { attr } from '@ember-data/model';

export default class Framework extends Model {
  @attr('string') name;
}
