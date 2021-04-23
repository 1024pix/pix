const _ = require('lodash');
module.exports = {
  checkEventTypes(receivedEvent, acceptedEventTypes) {
    if (!_.some(acceptedEventTypes, (acceptedEventType) => {
      return receivedEvent instanceof acceptedEventType;
    })) {
      const acceptedEventNames = acceptedEventTypes.map((acceptedEventType) => acceptedEventType.name);
      throw new Error(`event must be one of types ${acceptedEventNames.join(', ')}`);
    }
  },
};
