const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(training = {}) {
    return new Serializer('trainings', {
      attributes: ['duration', 'link', 'locale', 'title', 'type'],
    }).serialize(training);
  },
};
