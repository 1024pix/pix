const { domainBuilder, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/student-certification-serializer');
const StudentForEnrollment = require('../../../../../lib/domain/read-models/StudentForEnrollment');

describe('Unit | Serializer | JSONAPI | student-certification-serializer', () => {

  describe('#serialize', () => {

    it('should convert a StudentEnrollmentReadmodel model object into JSON API data', () => {
      // given
      const student = domainBuilder.buildSchoolingRegistration();
      const studentEnrollmentReadmodel = new StudentForEnrollment({
        ...student,
        isEnrolled: true,
      });

      const expectedSerializedStudent = {
        data: {
          type: 'students',
          id: `${studentEnrollmentReadmodel.id}`,
          attributes: {
            'first-name': studentEnrollmentReadmodel.firstName,
            'last-name': studentEnrollmentReadmodel.lastName,
            'birthdate': studentEnrollmentReadmodel.birthdate,
            'division': studentEnrollmentReadmodel.division,
            'is-enrolled': studentEnrollmentReadmodel.isEnrolled,
          },
        },
      };

      // when
      const json = serializer.serialize(studentEnrollmentReadmodel);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
