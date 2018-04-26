const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const moment = require('moment-timezone');

module.exports = {

  serialize(certificationCourse) {
    return new Serializer('certifications', {
      attributes: ['firstName', 'lastName', 'birthplace', 'birthdate', 'externalId']
    }).serialize(certificationCourse);
  },

  serializeCertification(certificationsList) {
    return new Serializer('certifications', {
      attributes: ['certificationCenter', 'date']
    }).serialize(certificationsList);
  },

  deserialize(json) {
    const birthdate = json.data.attributes.birthdate;

    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((certifications => {
        if (birthdate) {
          if (!moment(birthdate, 'DD/MM/YYYY').isValid()) {
            return Promise.reject(new WrongDateFormatError());
          }
          certifications.birthdate = moment(birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        }
        return certifications;
      }));

  }
};
