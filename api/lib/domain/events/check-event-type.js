module.exports = {
  checkEventType(event, eventType) {
    if (!(event instanceof eventType)) {
      throw new Error(`event must be of type ${eventType.name}`);
    }
  }
};
