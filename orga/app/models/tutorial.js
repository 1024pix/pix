import Model, { attr } from '@ember-data/model';

export default class Tutorial extends Model {
  @attr('string') title;
  @attr('string') link;
  @attr('string') format;
  @attr('string') duration;
  @attr('string') source;
}
