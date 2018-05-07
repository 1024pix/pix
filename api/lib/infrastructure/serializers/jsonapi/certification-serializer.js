const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const moment = require('moment-timezone');

module.exports = {

  // FIXME: rename as serialize
  serializeCertification(certification) {
    return new Serializer('certifications', {
      attributes: ['certificationCenter', 'date', 'isPublished', 'status', 'pixScore'],
    }).serialize(certification);
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
  },
};
