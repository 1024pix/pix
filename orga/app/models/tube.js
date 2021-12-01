import Model, { attr } from '@ember-data/model';

export default class Tube extends Model {
  @attr('string') name;
}