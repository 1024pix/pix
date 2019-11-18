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
      ],
      certifications : {
        ref: ['id']
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
      ],
    }).serialize(sessions);
  },

  deserialize(json) {
    const attributes = json.data.attributes;
    if (!isValidDate(attributes.date, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError();
    }

    const certificationCenterId = _.get(json.data, ['relationships', 'certification-center', 'data', 'id']);

    return new Session({
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
    });
  }
};
