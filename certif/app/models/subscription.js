import Model, { attr } from '@ember-data/model';

export default class SubscriptionModel extends Model {
  @attr('number') complementaryCertificationId;
  @attr('string') type;

  get isCore() {
    return this.type === 'CORE';
  }

  isClea(centerHabilitations) {
    const matchingHabilitation = centerHabilitations.find(
      (habilitation) => habilitation.id === this.complementaryCertificationId,
    );
    return matchingHabilitation?.key === 'CLEA' ?? false;
  }
}
