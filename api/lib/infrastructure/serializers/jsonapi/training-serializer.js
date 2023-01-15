const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(training = {}, meta) {
    return new Serializer('trainings', {
      attributes: ['duration', 'link', 'locale', 'title', 'type', 'editorName', 'editorLogoUrl'],
      meta,
    }).serialize(training);
  },

  deserialize(payload) {
    return new Deserializer({
      keyForAttribute: 'camelCase',
      transform(deserializedTraining) {
        const duration = deserializedTraining.duration;
        if (!duration) return deserializedTraining;

        const { days, hours, minutes } = duration;
        const formattedDuration = `${days}d${hours}h${minutes}m`;

        return {
          ...deserializedTraining,
          duration: formattedDuration,
        };
      },
    }).deserialize(payload);
  },
};
