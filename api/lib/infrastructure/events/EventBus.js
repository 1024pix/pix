import bluebird from 'bluebird';

class SubscriberList {
  constructor() {
    this._subscribers = new Map();
  }

  add(eventClass, subscriber) {
    if (!this._subscribers.has(eventClass)) {
      this._subscribers.set(eventClass, []);
    }
    this._subscribers.get(eventClass).push(subscriber);
  }

  get(event) {
    const subscribersToCall = [];

    this._subscribers.forEach((subscribers, eventClass) => {
      if (event instanceof eventClass) {
        subscribersToCall.push(...subscribers);
      }
    });

    return subscribersToCall;
  }
}

class EventBus {
  constructor(dependenciesBuilder) {
    this._subscriptions = new SubscriberList();
    this._dependenciesBuilder = dependenciesBuilder;
  }

  subscribe(event, subscriber) {
    this._subscriptions.add(event, subscriber);
  }

  async publish(event, domainTransaction) {
    const subscribersToCall = this._subscriptions.get(event);
    await bluebird.mapSeries(subscribersToCall, async (subscriberClass) => {
      //La transaction knex est injecté dans le subscriber via le constructeur
      //Du coup à chaque requête il faut re-instancier le subscriber pour passer
      //une nouvelle transaction.
      const subscriber = this._dependenciesBuilder.build(subscriberClass, domainTransaction);
      await subscriber.handle(event);
    });
  }
}

export default EventBus;
