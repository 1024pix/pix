import Model, { attr } from '@ember-data/model';

export const SUBSCRIPTION_TYPES = Object.freeze({
  CORE: 'CORE',
  COMPLEMENTARY: 'COMPLEMENTARY',
});

export const COMPLEMENTARY_KEYS = Object.freeze({
  CLEA: 'CLEA',
});

export default class SubscriptionModel extends Model {
  @attr('number') complementaryCertificationId;
  @attr('string') type;

  get isCore() {
    return this.type === SUBSCRIPTION_TYPES.CORE;
  }

  isClea(centerHabilitations) {
    const matchingHabilitation = centerHabilitations.find(
      (habilitation) => habilitation.id === this.complementaryCertificationId,
    );
    return matchingHabilitation?.key === COMPLEMENTARY_KEYS.CLEA ?? false;
  }
}
