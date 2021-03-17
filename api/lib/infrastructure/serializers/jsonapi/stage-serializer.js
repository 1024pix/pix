const Stage = require('../../../domain/models/Stage');
const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(stage = {}) {
    return new Serializer('stage', {
      ref: 'id',
      attributes: ['message', 'threshold', 'title', 'prescriberTitle', 'prescriberDescription'],
    }).serialize(stage);
  },
  deserialize(json) {
    return new Stage({
      title: json.data.attributes.title,
      message: json.data.attributes.message,
      threshold: json.data.attributes.threshold,
      targetProfileId: json.data.relationships['target-profile'].data.id,
      prescriberTitle: json.data.attributes['prescriber-title'],
      prescriberDescription: json.data.attributes['prescriber-description'],
    });
  },
};
