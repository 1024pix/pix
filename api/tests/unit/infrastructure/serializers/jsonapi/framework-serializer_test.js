import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/framework-serializer.js';
import { Framework } from '../../../../../lib/domain/models/Framework.js';

describe('Unit | Serializer | JSONAPI | framework-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const frameworks = [
        new Framework({ id: 'frameworkId1', name: 'Core' }),
        new Framework({ id: 'frameworkId2', name: 'frameworkName2' }),
      ];

      const expectedSerializedResult = {
        data: [
          {
            type: 'frameworks',
            id: 'frameworkId1',
            attributes: { name: 'Core', 'is-core': true },
            relationships: {
              areas: {
                links: {
                  related: '/api/admin/frameworks/frameworkId1/areas',
                },
              },
            },
          },
          {
            type: 'frameworks',
            id: 'frameworkId2',
            attributes: { name: 'frameworkName2', 'is-core': false },
            relationships: {
              areas: {
                links: {
                  related: '/api/admin/frameworks/frameworkId2/areas',
                },
              },
            },
          },
        ],
      };

      // when
      const result = serializer.serialize(frameworks);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
