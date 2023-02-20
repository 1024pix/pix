import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/framework-serializer';

describe('Unit | Serializer | JSONAPI | framework-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const frameworks = [
        { id: 'frameworkId1', name: 'frameworkName1' },
        { id: 'frameworkId2', name: 'frameworkName2' },
      ];

      const expectedSerializedResult = {
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
      };

      // when
      const result = serializer.serialize(frameworks);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
