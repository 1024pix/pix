const { domainBuilder, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/student-certification-serializer');
const StudentForEnrollement = require('../../../../../lib/domain/read-models/StudentForEnrollement');

describe('Unit | Serializer | JSONAPI | student-certification-serializer', () => {

  describe('#serialize', () => {

    it('should convert a StudentEnrollementReadmodel model object into JSON API data', () => {
      // given
      const student = domainBuilder.buildSchoolingRegistration();
      const studentEnrollementReadmodel = new StudentForEnrollement({
        ...student,
        isEnrolled: true,
      });

      const expectedSerializedStudent = {
        data: {
          type: 'students',
          id: `${studentEnrollementReadmodel.id}`,
          attributes: {
            'first-name': studentEnrollementReadmodel.firstName,
            'last-name': studentEnrollementReadmodel.lastName,
            'birthdate': studentEnrollementReadmodel.birthdate,
            'division': studentEnrollementReadmodel.division,
            'is-enrolled': studentEnrollementReadmodel.isEnrolled,
          },
        },
      };

      // when
      const json = serializer.serialize(studentEnrollementReadmodel);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
