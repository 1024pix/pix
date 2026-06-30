import jsonapiSerializer from 'jsonapi-serializer';

import { SessionManagement } from '../../domain/models/SessionManagement.js';

const { Serializer } = jsonapiSerializer;

export function serialize({ session, hasSomeCleaAcquired }) {
  const attributes = [
    'status',
    'examinerGlobalComment',
    'hasIncident',
    'hasJoiningIssue',
    'finalizedAt',
    'resultsSentToPrescriberAt',
    'publishedAt',
    'certificationReports',
    'hasSomeCleaAcquired',
    'version',
  ];
  return new Serializer('session-management', {
    transform(record) {
      if (hasSomeCleaAcquired !== undefined) {
        record.hasSomeCleaAcquired = hasSomeCleaAcquired;
      }
      return record;
    },
    attributes,
    certificationReports: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/sessions/${parent.id}/certification-reports`;
        },
      },
    },
  }).serialize(session);
}

export function deserialize(json) {
  const attributes = json.data.attributes;

  const result = new SessionManagement({
    id: json.data.id,
    certificationCenterId: attributes['certification-center-id'],
    status: attributes.status,
    examinerGlobalComment: attributes['examiner-global-comment'],
    hasIncident: attributes['has-incident'],
    hasJoiningIssue: attributes['has-joining-issue'],
    version: attributes['version'],
  });

  return result;
}
