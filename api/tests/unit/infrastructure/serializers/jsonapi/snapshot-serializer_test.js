const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');

describe('Unit | Serializer | JSONAPI | snapshot-serializer', () => {

  describe('#serialize', () => {

    it('should be a function', () => {
      // then
      expect(serializer.serialize).to.be.a('function');
    });

    it('should correctly serialize', () => {
      // given
      const expectedSerialization = {
        data: {
          type: 'snapshots',
          id: '7',
          attributes: {
            'id': '7'
          }
        }
      };

      const snapshot = { id: 7 };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.be.eql(expectedSerialization);
    });
  });
});
