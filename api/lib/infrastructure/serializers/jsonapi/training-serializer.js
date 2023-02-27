const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serializeForAdmin(training = {}, meta) {
    return new Serializer('trainings', {
      transform(training) {
        const duration = training.duration;
        duration.days = duration.days || 0;
        duration.hours = duration.hours || 0;
        duration.minutes = duration.minutes || 0;

        return {
          ...training,
          triggers: training.triggers.map((trigger) => ({
            ...trigger,
            triggerTubes: trigger.triggerTubes.map((triggerTube) => ({
              ...triggerTube,
              tube: { ...triggerTube.tube },
            })),
          })),
        };
      },
      attributes: [
        'duration',
        'link',
        'locale',
        'title',
        'type',
        'editorName',
        'editorLogoUrl',
        'triggers',
        'targetProfileSummaries',
      ],
      triggers: {
        ref: 'id',
        attributes: ['threshold', 'triggerTubes', 'type'],
        triggerTubes: {
          ref: 'id',
          attributes: ['level', 'tube'],
          tube: {
            ref: 'id',
            attributes: ['name', 'practicalTitle', 'skills'],
          },
        },
      },
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
      typeForAttribute(attribute) {
        switch (attribute) {
          case 'triggerTubes':
            return 'trigger-tubes';
          case 'tube':
            return 'tubes';
          default:
            return attribute;
        }
      },
      meta,
    }).serialize(training);
  },

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
