const { domainBuilder, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/student-certification-serializer');

describe('Unit | Serializer | JSONAPI | student-certification-serializer', () => {

  describe('#serialize', () => {

    it('should convert a SchoolingRegistration model object into JSON API data', () => {
      // given
      const student = domainBuilder.buildSchoolingRegistration();

      const expectedSerializedStudent = {
        data: {
          type: 'students',
          id: `${student.id}`,
          attributes: {
            'first-name': student.firstName,
            'last-name': student.lastName,
            'birthdate': student.birthdate,
            'division': student.division,
          },
        },
      };

      // when
      const json = serializer.serialize(student);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
