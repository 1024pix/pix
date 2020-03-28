const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');

const Session = require('../../../domain/models/Session');

module.exports = {

  serialize(sessions) {
    return new Serializer('session', {
      attributes: [
        'certificationCenterName',
        'address',
        'room',
        'examiner',
        'date',
        'time',
        'status',
        'description',
        'accessCode',
        'examinerGlobalComment',
        'finalizedAt',
        'resultsSentToPrescriberAt',
        'certifications',
        'certificationCandidates',
        'certificationReports',
        'certificationCenter',
        'assignedUser',
      ],
      certifications : {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/sessions/${parent.id}/certifications`;
          }
        }
      },
      certificationCandidates: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/sessions/${parent.id}/certification-candidates`;
          }
        }
      },
      certificationReports: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/sessions/${parent.id}/certification-reports`;
          }
        }
      },
      certificationCenter: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/certification-centers/${current.id}`;
          }
        }
      },
      assignedUser: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/users/${current.id}`;
          }
        }
      },
      transform(session) {
        const transformedSession = Object.assign({}, session);
        transformedSession.certifications = [];
        transformedSession.certificationReports = [];
        transformedSession.certificationCenterName = session.certificationCenter;
        delete transformedSession.certificationCenter;
        if (session.certificationCenterId) {
          transformedSession.certificationCenter = { id: session.certificationCenterId };
        }
        if (session.assignedUserId) {
          transformedSession.assignedUser = { id: session.assignedUserId };
        }
        return transformedSession;
      },
    }).serialize(sessions);

  },

  serializeForFinalization(sessions) {
    return new Serializer('session', {
      attributes: [
        'status',
        'examinerGlobalComment',
      ],
    }).serialize(sessions);
  },

  serializeForPaginatedFilteredResults(sessions, meta) {
    return new Serializer('session', {
      attributes: [
        'certificationCenterName',
        'date',
        'time',
        'status',
        'finalizedAt',
        'certifications',
        'certificationCenter',
        'assignedUser',
      ],
      certifications : {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/sessions/${parent.id}/certifications`;
          }
        }
      },
      certificationCenter: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/certification-centers/${current.id}`;
          }
        }
      },
      assignedUser: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/users/${current.id}`;
          }
        }
      },
      transform(session) {
        const transformedSession = Object.assign({}, session);
        transformedSession.certifications = [];
        transformedSession.certificationCenterName = session.certificationCenter;
        delete transformedSession.certificationCenter;
        if (session.certificationCenterId) {
          transformedSession.certificationCenter = { id: session.certificationCenterId };
        }
        if (session.assignedUserId) {
          transformedSession.assignedUser = { id: session.assignedUserId };
        }
        return transformedSession;
      },
      meta,
    }).serialize(sessions);
  },

  deserialize(json) {
    const attributes = json.data.attributes;
    if (!isValidDate(attributes.date, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError();
    }

    const certificationCenterId = _.get(json.data, ['relationships', 'certification-center', 'data', 'id']);

    const result = new Session({
      id: json.data.id,
      certificationCenterId: certificationCenterId ? parseInt(certificationCenterId) : null,
      address: attributes.address,
      room: attributes.room,
      examiner: attributes.examiner,
      date: attributes.date,
      time: attributes.time,
      status: attributes.status,
      description: attributes.description,
      examinerGlobalComment: attributes['examiner-global-comment'],
    });

    if (_.isEmpty(_.trim(result.examinerGlobalComment))) {
      result.examinerGlobalComment = Session.NO_EXAMINER_GLOBAL_COMMENT;
    }

    return result;
  }
};
