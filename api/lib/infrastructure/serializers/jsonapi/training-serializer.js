const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(training = {}, meta) {
    return new Serializer('trainings', {
      attributes: [
        'duration',
        'link',
        'locale',
        'title',
        'type',
        'editorName',
        'editorLogoUrl',
        'targetProfileSummaries',
      ],
      targetProfileSummaries: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/admin/trainings/${parent.id}/target-profile-summaries`;
          },
        },
      },
      meta,
      transform(training) {
        const duration = training.duration;
        duration.days = duration.days || 0;
        duration.hours = duration.hours || 0;
        duration.minutes = duration.minutes || 0;
        return training;
      },
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
