import { domainBuilder, expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/student-certification-serializer';
import StudentForEnrollment from '../../../../../lib/domain/read-models/StudentForEnrollment';

describe('Unit | Serializer | JSONAPI | student-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a StudentEnrollmentReadmodel model object into JSON API data', function () {
      // given
      const student = domainBuilder.buildOrganizationLearner();
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
            birthdate: studentEnrollmentReadmodel.birthdate,
            division: studentEnrollmentReadmodel.division,
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
