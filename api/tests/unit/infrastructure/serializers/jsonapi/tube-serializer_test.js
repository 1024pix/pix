const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tube-serializer');

describe('Unit | Serializer | JSONAPI | tube-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const tubeId = 456;

      const tube = domainBuilder.buildTube({
        id: tubeId,
      });

      const expectedSerializedResult = {
        data: {
          id: tubeId.toString(),
          type: 'tubes',
          attributes: {
            'practical-title': 'titre pratique',
            'practical-description': 'description pratique',
            'competence-id': 'recCOMP123',
          },
        },
      };

      // when
      const result = serializer.serialize(tube);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
