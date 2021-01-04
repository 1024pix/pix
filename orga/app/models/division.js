import Model, { attr } from '@ember-data/model';

export default class Division extends Model {
  @attr('string') name;
}
