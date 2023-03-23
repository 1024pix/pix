const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const Session = require('../../../domain/models/Session.js');

module.exports = {
  serialize({ session, hasSupervisorAccess, hasSomeCleaAcquired }) {
    const attributes = [
      'address',
      'room',
      'examiner',
      'date',
      'time',
      'status',
      'description',
      'accessCode',
      'examinerGlobalComment',
      'hasIncident',
      'hasJoiningIssue',
      'finalizedAt',
      'resultsSentToPrescriberAt',
      'publishedAt',
      'certificationCenterId',
      'certificationCandidates',
      'certificationReports',
      'supervisorPassword',
      'hasSupervisorAccess',
      'hasSomeCleaAcquired',
    ];
    return new Serializer('session', {
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
      certificationCandidates: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/sessions/${parent.id}/certification-candidates`;
          },
        },
      },
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
  },

  deserialize(json) {
    const attributes = json.data.attributes;

    const result = new Session({
      id: json.data.id,
      certificationCenterId: attributes['certification-center-id'],
      address: attributes.address,
      room: attributes.room,
      examiner: attributes.examiner,
      date: attributes.date,
      time: attributes.time,
      status: attributes.status,
      description: attributes.description,
      examinerGlobalComment: attributes['examiner-global-comment'],
      hasIncident: attributes['has-incident'],
      hasJoiningIssue: attributes['has-joining-issue'],
    });

    if (_.isEmpty(_.trim(result.examinerGlobalComment))) {
      result.examinerGlobalComment = Session.NO_EXAMINER_GLOBAL_COMMENT;
    }

    return result;
  },
};
