import Model, { attr } from '@ember-data/model';

export default class PixScore extends Model {

  // attributes
  @attr('number') value;
}
