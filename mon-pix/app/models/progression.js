import Model, { attr } from '@ember-data/model';

export default class Progression extends Model {
  @attr('number') completionRate;
}
