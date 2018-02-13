const { Serializer } = require('jsonapi-serializer');
const Session = require('../../../domain/models/Session');

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
    return new Session({
      id: json.data.id,
      certificationCenter: json.data.attributes['certification-center'],
      address: json.data.attributes.address,
      room: json.data.attributes.room,
      examiner: json.data.attributes.examiner,
      date: json.data.attributes.date,
      time: json.data.attributes.time,
      description: json.data.attributes.description
    });
  }

};
