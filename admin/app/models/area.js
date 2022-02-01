import Model, { attr } from '@ember-data/model';

export default class Area extends Model {
  @attr('string') title;
  @attr('string') color;
}
