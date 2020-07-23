import Model, { attr } from '@ember-data/model';

export default class Tutorial extends Model {
  @attr('string') title;
  @attr('string') link;
}
