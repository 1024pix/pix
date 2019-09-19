const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const Session = require('../../../domain/models/Session');

const moment = require('moment');

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

  deserialize(json) {
    const attributes = json.data.attributes;

    const certificationCenterId = _.get(json.data, ['relationships', 'certification-center', 'data', 'id']);

    return new Session({
      id: json.data.id,
      certificationCenter: attributes['certification-center'],
      certificationCenterId: certificationCenterId ? parseInt(certificationCenterId) : null,
      address: attributes.address,
      room: attributes.room,
      examiner: attributes.examiner,
      date: moment.utc(attributes.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      time: attributes.time,
      description: attributes.description,
    });
  }
};
