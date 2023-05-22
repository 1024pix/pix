import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

const serializeForAdmin = function (training = {}, meta) {
  return new Serializer('trainings', {
    transform(record) {
      const duration = record.duration;
      duration.days = duration.days || 0;
      duration.hours = duration.hours || 0;
      duration.minutes = duration.minutes || 0;

      return JSON.parse(JSON.stringify({ ...record, isRecommendable: record.isRecommendable }));
    },
    attributes: [
      'id',
      'duration',
      'link',
      'locale',
      'title',
      'type',
      'editorName',
      'editorLogoUrl',
      'trainingTriggers',
      'targetProfileSummaries',
      'isRecommendable',
    ],
    trainingTriggers: {
      ref: 'id',
      attributes: ['id', 'trainingId', 'type', 'threshold', 'areas', 'tubesCount'],
      areas: {
        ref: 'id',
        included: true,
        attributes: ['id', 'title', 'code', 'color', 'competences'],
        competences: {
          ref: 'id',
          included: true,
          attributes: ['id', 'name', 'index', 'thematics'],
          thematics: {
            ref: 'id',
            included: true,
            attributes: ['id', 'name', 'index', 'triggerTubes'],
            triggerTubes: {
              ref: 'id',
              included: true,
              attributes: ['id', 'level', 'tube'],
              tube: {
                ref: 'id',
                included: true,
                attributes: ['id', 'name', 'practicalTitle'],
              },
            },
          },
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
    meta,
    typeForAttribute(attribute) {
      switch (attribute) {
        case 'trainingTriggers':
          return 'training-triggers';
        case 'triggerTubes':
          return 'trigger-tubes';
        case 'tube':
          return 'tubes';
        default:
          return attribute;
      }
    },
  }).serialize(training);
};

const serialize = function (training = {}, meta) {
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
};

const deserialize = function (payload) {
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
};

export { serializeForAdmin, serialize, deserialize };
