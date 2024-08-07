import Model, { attr } from '@ember-data/model';

export default class SubscriptionModel extends Model {
  @attr('number') complementaryCertificationId;
  @attr('string') type;

  get isCore() {
    return this.type === 'CORE';
  }
}
