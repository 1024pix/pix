import Model, { attr } from '@ember-data/model';

export default class Activity extends Model {
  @attr('string') level;
}
