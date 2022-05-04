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
          level: 1,
        },
        {
          id: 'skillId2',
          name: 'skill1',
          level: 2,
        },
      ];

      const expectedSerializedResult = {
        data: [
          {
            type: 'skills',
            id: 'skillId1',
            attributes: {
              level: 1,
            },
          },
          {
            type: 'skills',
            id: 'skillId2',
            attributes: {
              level: 2,
            },
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
