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

  async dispatch(dispatchedEvent, domainTransaction) {

    const eventQueue = new EventQueue();
    eventQueue.push(dispatchedEvent);

    while (!eventQueue.isEmpty()) {
      const eventToDispatch = eventQueue.shift();
      const eventHandlers = this._findEventHandlersByEventType(eventToDispatch);

      for (const eventHandler of eventHandlers) {
        const resultingEventOrEvents = await eventHandler({ domainTransaction, event: eventToDispatch });
        eventQueue.push(resultingEventOrEvents);
      }
    }
  }

  _findEventHandlersByEventType(eventToDispatch) {
    return this._subscriptions
      .filter(({ event: subscribedEvent }) => eventToDispatch instanceof subscribedEvent)
      .map((subscription) => subscription.eventHandler);
  }
}

class EventQueue {
  constructor() {
    this.events = [];
  }

  push(eventOrEvents) {
    if (eventOrEvents) {
      if (!Array.isArray(eventOrEvents)) {
        this.events.push(eventOrEvents);
      } else {
        this.events.push(...eventOrEvents);
      }
    }
  }

  shift() {
    return this.events.shift();
  }

  isEmpty() {
    return this.events.length <= 0;
  }
}

module.exports = EventDispatcher;
