const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(smartPlacementProgression) {
    return new Serializer('smart-placement-progression', {
      attributes: ['validationRate', 'completionRate'],
    }).serialize(smartPlacementProgression);
  }
};
