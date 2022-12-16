import Model, { attr } from '@ember-data/model';

export default class Country extends Model {
  @attr('string') code;
  @attr('string') name;
}
