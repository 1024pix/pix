const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');

const Session = require('../../../domain/models/Session');

module.exports = {

  serialize(sessions) {
    return new Serializer('session', {
      attributes: [
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
        'publishedAt',
        'certificationCenterId',
        'certificationCandidates',
        'certificationReports',
      ],
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
    }).serialize(sessions);

  },

  serializeForFinalization(sessions) {
    return new Serializer('session', {
      attributes: [
        'status',
        'examinerGlobalComment',
      ],
      transform(session) {
        return { ...session, status: session.status };
      },
    }).serialize(sessions);
  },

  serializeSessionScheduledEvent(events) {
    return new Serializer('session', {
      transform(event) {
        return { id: event.sessionId };
      },
    }).serialize(events);
  },

  deserialize(json) {
    const attributes = json.data.attributes;
    if (!isValidDate(attributes.date, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError();
    }

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
    });

    if (_.isEmpty(_.trim(result.examinerGlobalComment))) {
      result.examinerGlobalComment = Session.NO_EXAMINER_GLOBAL_COMMENT;
    }

    return result;
  },
};
