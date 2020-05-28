const _ = require('lodash');

class EventDispatcher {
  constructor() {
    this._subscriptions = [];
  }

  subscribe(event, eventHandler) {
    this._preventDuplicateSubscription(event, eventHandler);
    this._subscriptions.push({ event: event.prototype.constructor, eventHandler: eventHandler });
  }

  _preventDuplicateSubscription(event, eventHandler) {
    const foundDuplicateSubscription = _.some(this._subscriptions, _.matches({ event, eventHandler }));
    if (foundDuplicateSubscription) {
      throw new Error('Cannot subscribe twice to a given event with the same handler');
    }
  }

  async dispatch(domainTransaction, dispatchedEvent) {
    const subscriptions = this._subscriptions.filter(({ event }) => dispatchedEvent instanceof event);

    for (const { eventHandler } of subscriptions) {
      const returnedEvent = await eventHandler({ domainTransaction, event: dispatchedEvent });
      await this.dispatch(domainTransaction, returnedEvent);
    }
  }
}

module.exports = EventDispatcher;
