const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');

const Session = require('../../../domain/models/Session');

module.exports = {

  serialize(sessions) {
    return new Serializer('session', {
      attributes: [
        'certificationCenter',
        'address',
        'room',
        'examiner',
        'date',
        'time',
        'status',
        'description',
        'accessCode',
        'certifications',
        'certificationCandidates',
        'certificationReports',
        'examinerGlobalComment',
        'finalizedAt',
        'resultsSentToPrescriberAt',
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
      transform(session) {
        const transformedSession = Object.assign({}, session);
        transformedSession.certifications = [];
        transformedSession.certificationReports = [];
        return transformedSession;
      }
    }).serialize(sessions);
  },

  serializeForFinalization(sessions) {
    return new Serializer('session', {
      attributes: [
        'certificationCenter',
        'address',
        'room',
        'examiner',
        'date',
        'time',
        'status',
        'description',
        'accessCode',
        'examinerGlobalComment',
      ],
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
      certificationCenter: attributes['certification-center'],
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
