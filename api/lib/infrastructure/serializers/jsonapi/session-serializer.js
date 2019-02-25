const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const Session = require('../../../domain/models/Session');

const moment = require('moment-timezone');

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
        'certifications'
      ],
      certifications : {
        ref: ['id']
      }
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
      date: moment(attributes.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      time: attributes.time,
      description: attributes.description,
    });
  }
};
