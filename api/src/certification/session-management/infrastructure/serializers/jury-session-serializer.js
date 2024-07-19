import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (jurySessions, hasSupervisorAccess, meta) {
  return new Serializer('sessions', {
    attributes: [
      'certificationCenterName',
      'certificationCenterType',
      'certificationCenterId',
      'certificationCenterExternalId',
      'address',
      'room',
      'examiner',
      'date',
      'time',
      'accessCode',
      'status',
      'description',
      'examinerGlobalComment',
      'finalizedAt',
      'resultsSentToPrescriberAt',
      'publishedAt',
      'juryComment',
      'juryCommentAuthorId',
      'juryCommentedAt',
      'hasSupervisorAccess',
      'hasJoiningIssue',
      'hasIncident',
      'version',
      // included
      'assignedCertificationOfficer',
      'juryCommentAuthor',
      // links
      'juryCertificationSummaries',
    ],
    juryCertificationSummaries: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/admin/sessions/${parent.id}/jury-certification-summaries`;
        },
      },
    },
    assignedCertificationOfficer: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName'],
    },
    juryCommentAuthor: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName'],
    },
    transform(jurySession) {
      const transformedJurySession = Object.assign({}, jurySession);
      transformedJurySession.status = jurySession.status;
      if (hasSupervisorAccess !== undefined) {
        transformedJurySession.hasSupervisorAccess = hasSupervisorAccess;
      }
      return transformedJurySession;
    },
    typeForAttribute: function (attribute) {
      if (attribute === 'assignedCertificationOfficer') {
        return 'user';
      }
      if (attribute === 'juryCommentAuthor') {
        return 'user';
      }
      return attribute;
    },
    meta,
  }).serialize(jurySessions);
};

const serializeForPaginatedList = function (jurySessionsForPaginatedList, injectedSerialize = serialize) {
  const { jurySessions, pagination } = jurySessionsForPaginatedList;
  return injectedSerialize(jurySessions, undefined, pagination);
};

export { serialize, serializeForPaginatedList };
