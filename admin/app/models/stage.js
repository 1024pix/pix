import Model, { attr } from '@ember-data/model';

export default class Stage extends Model {
  @attr('number') threshold;
  @attr('string') title;
  @attr('string') message;
}
