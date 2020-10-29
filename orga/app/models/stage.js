import Model, { attr } from '@ember-data/model';

export default class Stage extends Model {
  @attr('string') message;
  @attr('string') title;
  @attr('number') threshold;
}
