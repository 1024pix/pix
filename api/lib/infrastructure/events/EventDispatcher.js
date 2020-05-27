class EventDispatcher {
  constructor() {
    this._subscriptions = [];
  }

  subscribe(event, eventHandler) {
    this._subscriptions.push([event, eventHandler]);
  }

  dispatch(domainTransaction, dispatchedEvent) {
    const subscriptions = this._subscriptions.filter(([event, _]) => {
      return event == dispatchedEvent;
    });

    subscriptions.forEach(([_, eventHandler]) => {
      const returnedEvent = eventHandler.handle(domainTransaction, dispatchedEvent);
      this.dispatch(domainTransaction, returnedEvent);
    });
  }
}

module.exports = EventDispatcher;
