class Event {
  get attributes() {
    return {
      event: this.constructor.name,
      attributes: { ...this },
    };
  }
}

export default Event;
