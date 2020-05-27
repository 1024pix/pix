class EventDispatcher {
  constructor() {
    this._subscribers = [];
  }
  subscribe(event, subscriber) {
    this._subscribers.push(subscriber);
  }

  dispatch(event) {
    this._subscribers.forEach((subscriber) => {
      subscriber.handle(event);
    });
  }
}

module.exports = EventDispatcher;
