const _ = require('lodash');
const { addEventDispatchLogToRequestContext, logErrorWithCorrelationIds } = require('../monitoring-tools');
const { performance } = require('perf_hooks');

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
    const subscriptions = this._subscriptions.filter(({ event }) => dispatchedEvent instanceof event);

    for (const { eventHandler } of subscriptions) {
      const dispatchStartTime = performance.now();
      let error;
      try {
        const returnedEventOrEvents = await eventHandler({ domainTransaction, event: dispatchedEvent });
        this._logEventDispatchWithCorrelationId({ event: dispatchedEvent, eventHandler: eventHandler.handlerName, dispatchStartTime });
        await this._dispatchEventOrEvents(returnedEventOrEvents, domainTransaction);
      } catch (e) {
        error = e;
        this._logEventDispatchWithCorrelationId({ event: dispatchedEvent, eventHandler: eventHandler.handlerName, error, dispatchStartTime });
      }
    }
  }

  async _dispatchEventOrEvents(eventOrEvents, domainTransaction) {
    if (!Array.isArray(eventOrEvents)) {
      await this.dispatch(eventOrEvents, domainTransaction);
    } else {
      for (const event of eventOrEvents) {
        await this.dispatch(event, domainTransaction);
      }
    }
  }

  _logEventDispatchWithCorrelationId({ event, eventHandler, error, dispatchStartTime }) {
    let message = 'EventDispatcher : dispatched event successfully';
    if (error) {
      message = 'EventDispatcher : an error occurred while dispatching an event';
      logErrorWithCorrelationIds(error);
    }
    const duration = performance.now() - dispatchStartTime;
    addEventDispatchLogToRequestContext({ eventName: event.constructor.name, eventContent: event, eventHandler, error, duration, message });
  }
}

module.exports = EventDispatcher;
