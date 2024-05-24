import jsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

import { SessionManagement } from '../../domain/models/SessionManagement.js';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ session, hasSupervisorAccess, hasSomeCleaAcquired }) {
  const attributes = [
    'status',
    'examinerGlobalComment',
    'hasIncident',
    'hasJoiningIssue',
    'finalizedAt',
    'resultsSentToPrescriberAt',
    'publishedAt',
    'certificationReports',
    'hasSupervisorAccess',
    'hasSomeCleaAcquired',
    'version',
  ];
  return new Serializer('session-management', {
    transform(record) {
      if (hasSupervisorAccess !== undefined) {
        record.hasSupervisorAccess = hasSupervisorAccess;
      }
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
};

const deserialize = function (json) {
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

  if (_.isEmpty(_.trim(result.examinerGlobalComment))) {
    result.examinerGlobalComment = SessionManagement.NO_EXAMINER_GLOBAL_COMMENT;
  }

  return result;
};

export { deserialize, serialize };
