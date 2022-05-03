const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/skill-serializer');

describe('Unit | Serializer | JSONAPI | skill-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const skills = [
        {
          id: 'skillId1',
          name: 'skill1',
        },
        {
          id: 'skillId2',
          name: 'skill1',
        },
      ];

      const expectedSerializedResult = {
        data: [
          {
            type: 'skills',
            id: 'skillId1',
          },
          {
            type: 'skills',
            id: 'skillId2',
          },
        ],
      };

      // when
      const result = serializer.serialize(skills);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
