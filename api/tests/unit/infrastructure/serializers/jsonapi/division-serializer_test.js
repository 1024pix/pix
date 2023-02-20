import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/division-serializer';

describe('Unit | Serializer | JSONAPI | division-serializer', function () {
  describe('#serialize', function () {
    it('serializes all division', function () {
      // when
      const json = serializer.serialize([{ name: '6eme' }, { name: '3eme' }]);
      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'divisions',
            id: '6eme',
            attributes: {
              name: '6eme',
            },
          },
          {
            type: 'divisions',
            id: '3eme',
            attributes: {
              name: '3eme',
            },
          },
        ],
      });
    });
  });
});
