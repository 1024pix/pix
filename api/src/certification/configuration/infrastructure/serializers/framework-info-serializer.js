import jsonapiSerializer from 'jsonapi-serializer';

import { SCOPES } from '../../../shared/domain/models/Scopes.js';

const { Serializer } = jsonapiSerializer;

export function serialize(frameworkInfo) {
  return new Serializer('certification-frameworks', {
    id: 'scope',
    attributes: ['scope', 'versionSummaries', 'complementaryCertification'],
    versionSummaries: {
      included: true,
      ref: 'id',
      attributes: ['startDate', 'expirationDate', 'assessmentDuration', 'maximumAssessmentLength', 'status'],
    },
    complementaryCertification: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          if (parent.id === SCOPES.CORE) {
            return null;
          }
          return `/api/admin/complementary-certifications/${parent.id}/target-profiles`;
        },
      },
    },
    typeForAttribute: function (attribute) {
      if (attribute === 'versionSummaries') {
        return 'certification-version-summaries';
      }
      return attribute;
    },
  }).serialize(frameworkInfo);
}
