import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/student-certification-serializer.js';
import { StudentForEnrolment } from '../../../../../src/shared/domain/read-models/StudentForEnrolment.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | student-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a StudentEnrolmentReadmodel model object into JSON API data', function () {
      // given
      const student = domainBuilder.buildOrganizationLearner();
      const studentEnrolmentReadmodel = new StudentForEnrolment({
        ...student,
        isEnrolled: true,
      });

      const expectedSerializedStudent = {
        data: {
          type: 'students',
          id: `${studentEnrolmentReadmodel.id}`,
          attributes: {
            'first-name': studentEnrolmentReadmodel.firstName,
            'last-name': studentEnrolmentReadmodel.lastName,
            birthdate: studentEnrolmentReadmodel.birthdate,
            division: studentEnrolmentReadmodel.division,
            'is-enrolled': studentEnrolmentReadmodel.isEnrolled,
          },
        },
      };

      // when
      const json = serializer.serialize(studentEnrolmentReadmodel);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
