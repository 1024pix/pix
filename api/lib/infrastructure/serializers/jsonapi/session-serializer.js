const { Serializer } = require('jsonapi-serializer');
const Session = require('../../../domain/models/Session');
const sessionCodeService = require('../../../domain/services/session-code-service');

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
        'description',
        'accessCode'
      ]
    }).serialize(modelSession);
  },

  deserialize(json) {
    const attributes = json.data.attributes;

    if (!moment(attributes.date, 'DD/MM/YYYY').isValid()) {
      throw new WrongDateFormatError();
    }

    return sessionCodeService.getNewSessionCode()
      .then((accessCode) => {
        return new Session({
          id: json.data.id,
          certificationCenter: attributes['certification-center'],
          address: attributes.address,
          room: attributes.room,
          examiner: attributes.examiner,
          date: moment(attributes.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          time: attributes.time,
          description: attributes.description,
          accessCode: accessCode,
        });
      });
  }
};
