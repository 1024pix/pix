import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(frameworkInfo) {
  return new Serializer('certification-frameworks', {
    id: 'scope',
    attributes: ['scope', 'versionSummaries', 'targetProfileSummaries'],
    versionSummaries: {
      included: true,
      ref: 'id',
      attributes: ['startDate', 'expirationDate', 'assessmentDuration', 'maximumAssessmentLength', 'status'],
    },
    targetProfileSummaries: {
      included: true,
      ref: 'id',
      attributes: ['name', 'badgeSummaries'],
      badgeSummaries: {
        included: true,
        ref: 'id',
        attributes: ['label', 'level', 'imageUrl', 'minimumEarnedPix', 'createdAt', 'detachedAt'],
      },
    },
    typeForAttribute: function (attribute) {
      if (attribute === 'versionSummaries') {
        return 'certification-version-summaries';
      }
      if (attribute === 'targetProfileSummaries') {
        return 'certification-target-profile-summaries';
      }
      if (attribute === 'badgeSummaries') {
        return 'certification-badge-summaries';
      }
      return attribute;
    },
  }).serialize(frameworkInfo);
}
