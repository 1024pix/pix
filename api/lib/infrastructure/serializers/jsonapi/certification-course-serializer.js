const { Serializer } = require('jsonapi-serializer');
const CertificationCourse = require('../../../domain/models/CertificationCourse');

const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');

module.exports = {

  serialize(certificationCourse) {

    return new Serializer('certification-course', {
      transform(currentCertificationCourse) {
        const certificationCourse = Object.assign({}, currentCertificationCourse);
        certificationCourse.nbChallenges = currentCertificationCourse.challenges ? currentCertificationCourse.challenges.length : 0;

        return certificationCourse;
      },
      attributes: [
        'assessment',
        'nbChallenges',
        'examinerComment',
        'hasSeenEndTestScreen',
      ],
      assessment: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/assessments/${current.id}`;
          }
        }
      },
    }).serialize(certificationCourse);
  },

  deserialize(json) {
    if (!isValidDate(json.data.attributes.birthdate, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError();
    }

    return new CertificationCourse({
      id: json.data.id,
      createdAt: json.data.attributes.createdAt,
      updatedAt: json.data.attributes.updatedAt,
      userId: json.data.attributes.userId,
      completedAt: json.data.attributes.completedAt,
      firstName: json.data.attributes.firstName,
      lastName: json.data.attributes.lastName,
      birthdate: json.data.attributes.birthdate,
      birthplace: json.data.attributes.birthplace,
      isV2Certification: json.data.attributes.isV2Certification,
      examinerComment: json.data.attributes.examinerComment,
      hasSeenEndTestScreen: json.data.attributes.hasSeenEndTestScreen,
    });
  },
};
