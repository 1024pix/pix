import _ from 'lodash';

class EventDispatcher {
  constructor(logger) {
    this._subscriptions = [];
    this._logger = logger;
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
        try {
          const context = this._logger.onEventDispatchStarted(eventToDispatch, eventHandler.handlerName);
          const resultingEventOrEvents = await eventHandler({ domainTransaction, event: eventToDispatch });
          this._logger.onEventDispatchSuccess(eventToDispatch, eventHandler.handlerName, context);

          eventQueue.push(resultingEventOrEvents);
        } catch (error) {
          this._logger.onEventDispatchFailure(eventToDispatch, eventHandler.handlerName, error);
          throw error;
        }
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

export default EventDispatcher;
