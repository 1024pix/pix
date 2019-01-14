const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(smartPlacementProgression) {
    return new Serializer('smart-placement-progression', {
      attributes: ['masteryRate', 'completionRate'],
    }).serialize(smartPlacementProgression);
  }
};
