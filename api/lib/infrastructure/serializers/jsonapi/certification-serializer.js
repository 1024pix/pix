const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const moment = require('moment-timezone');

module.exports = {

  serialize(certification) {

    return new Serializer('certifications', {
      attributes: [
        'certificationCenter',
        'birthdate',
        'date',
        'firstName',
        'isPublished',
        'lastName',
        'status',
        'pixScore',
        'commentForCandidate',
        'certifiedProfile',
      ],
      transform: (record) => {
        const certification = Object.assign({}, record);
        certification.certifiedProfile = (certification.certifiedProfile) ?
          certification.certifiedProfile.organizeCompetences() : null;
        return certification;
      }
    }).serialize(certification);
  },

  serializeFromCertificationCourse(certificationCourse) {
    return new Serializer('certifications', {
      attributes: ['firstName', 'lastName', 'birthplace', 'birthdate', 'externalId'],
    }).serialize(certificationCourse);
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
