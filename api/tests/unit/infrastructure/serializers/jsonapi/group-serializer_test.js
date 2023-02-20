import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/group-serializer';

describe('Unit | Serializer | JSONAPI | group-serializer', function () {
  describe('#serialize', function () {
    it('serializes all groups', function () {
      // when
      const json = serializer.serialize([{ name: 'LB6' }, { name: 'AB3' }]);
      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'groups',
            id: 'LB6',
            attributes: {
              name: 'LB6',
            },
          },
          {
            type: 'groups',
            id: 'AB3',
            attributes: {
              name: 'AB3',
            },
          },
        ],
      });
    });
  });
});
