import { Framework } from '../../../../../../../src/prescription/target-profile/domain/read-models/Framework.js';
import * as serializer from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/framework-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Prescription | Target Profile | Unit | Serializer | JSONAPI | framework', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const frameworks = [
        new Framework({ id: 'frameworkId1', name: 'frameworkName1' }),
        new Framework({ id: 'frameworkId2', name: 'frameworkName2' }),
      ];

      // when
      const result = serializer.serialize(frameworks);

      // then
      expect(result).to.deep.equal({
        data: [
          {
            type: 'frameworks',
            id: 'frameworkId1',
            attributes: { name: 'frameworkName1' },
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
            attributes: { name: 'frameworkName2' },
            relationships: {
              areas: {
                links: {
                  related: '/api/admin/frameworks/frameworkId2/areas',
                },
              },
            },
          },
        ],
      });
    });
  });
});
