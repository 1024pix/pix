const { Serializer } = require('jsonapi-serializer');
const Session = require('../../../domain/models/Session');

const { WrongDateFormatError } = require('../../../domain/errors');
const moment = require('moment-timezone');

module.exports = {

  serialize(modelSession) {

    return new Serializer('session', {
      attributes: [
        'certificationCenter',
        'address',
        'room',
        'examiner',
        'date',
        'time',
        'description'
      ]
    }).serialize(modelSession);
  },

  deserialize(json) {
    if (!moment(json.data.attributes.date, 'DD/MM/YYYY').isValid()) {
      throw new WrongDateFormatError();
    }

    return new Session({
      id: json.data.id,
      certificationCenter: json.data.attributes['certification-center'],
      address: json.data.attributes.address,
      room: json.data.attributes.room,
      examiner: json.data.attributes.examiner,
      date: moment(json.data.attributes.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      time: json.data.attributes.time,
      description: json.data.attributes.description
    });
  }
};
