import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer';

describe('Unit | Serializer | JSONAPI | target-profile-attach-organization-serializer', function () {
  describe('#serialize', function () {
    it('should convert a target profile attach organization object to JSON API data', function () {
      const json = serializer.serialize({
        targetProfileId: 1,
        attachedIds: [1, 5],
        duplicatedIds: [8, 9],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'target-profile-attach-organizations',
          id: '1',
          attributes: {
            'attached-ids': [1, 5],
            'duplicated-ids': [8, 9],
          },
        },
      });
    });
  });
});
