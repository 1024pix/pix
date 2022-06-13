import Model, { attr } from '@ember-data/model';

export default class TargetProfileTemplate extends Model {
  @attr('array') tubes;
}
