const { Serializer, Deserializer } = require('jsonapi-serializer');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate');
const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');
const _ = require('lodash');

module.exports = {
  serialize(certificationCandidates) {
    return new Serializer('certification-candidate', {
      transform: function(certificationCandidate) {
        const certificationCourseId = !_.isUndefined(certificationCandidate.certificationCourse) ?
          certificationCandidate.certificationCourse.id : undefined;
        return {
          ...certificationCandidate,
          isLinked: !_.isNil(certificationCandidate.userId),
          certificationCourseId,
        };
      },
      attributes: [
        'firstName',
        'lastName',
        'birthdate',
        'birthProvinceCode',
        'birthCity',
        'birthCountry',
        'email',
        'externalId',
        'extraTimePercentage',
        'isLinked',
        'certificationCourseId',
      ],
    }).serialize(certificationCandidates);
  },

  async deserialize(json) {
    if (json.data.attributes.birthdate && !isValidDate(json.data.attributes.birthdate, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError('La date de naissance du candidate à la certification n\'a pas un format valide du type JJ/MM/AAAA');
    }

    delete json.data.attributes['is-linked'];
    delete json.data.attributes['certification-course-id'];

    const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
    const deserializedCandidate = await deserializer.deserialize(json);
    return new CertificationCandidate(deserializedCandidate);
  },
};
