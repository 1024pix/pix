class EventDispatcher {
  constructor() {
    this._subscriptions = [];
  }

  subscribe(event, subscriber) {
    this._subscriptions.push([event, subscriber]);
  }

  dispatch(dispatchedEvent) {
    const subscriptions = this._subscriptions.filter(([event, _]) => {
      return event == dispatchedEvent;
    });

    subscriptions.forEach(([_, subscriber]) => {
      subscriber.handle(dispatchedEvent);
    });
  }
}

module.exports = EventDispatcher;
