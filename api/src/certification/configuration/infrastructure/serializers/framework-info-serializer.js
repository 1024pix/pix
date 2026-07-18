import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(frameworkInfo) {
  return new Serializer('certification-frameworks', {
    id: 'scope',
    attributes: ['scope', 'versionSummaries'],
    versionSummaries: {
      included: true,
      ref: 'id',
      attributes: ['startDate', 'expirationDate', 'assessmentDuration', 'maximumAssessmentLength', 'status'],
    },
    typeForAttribute: function (attribute) {
      if (attribute === 'versionSummaries') {
        return 'certification-version-summaries';
      }
      return attribute;
    },
  }).serialize(frameworkInfo);
}
