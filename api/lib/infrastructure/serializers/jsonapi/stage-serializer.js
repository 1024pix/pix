const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(stage = {}) {
    return new Serializer('stage', {
      ref: 'id',
      attributes: ['message', 'threshold', 'level', 'title', 'prescriberTitle', 'prescriberDescription'],
    }).serialize(stage);
  },
  deserialize(json) {
    return {
      id: json.data?.id,
      title: json.data.attributes.title,
      message: json.data.attributes.message,
      threshold: json.data.attributes.threshold,
      level: json.data.attributes.level,
      targetProfileId: json.data.relationships['target-profile']?.data.id,
      prescriberTitle: json.data.attributes['prescriber-title'],
      prescriberDescription: json.data.attributes['prescriber-description'],
    };
  },
};
