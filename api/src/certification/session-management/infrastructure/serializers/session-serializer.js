import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize({ session, hasSomeCleaAcquired }) {
  const attributes = [
    'status',
    'examinerGlobalComment',
    'hasIncident',
    'hasJoiningIssue',
    'hasExpired',
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
