import * as serializer from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-detach-organizations-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | target-profile-detach-organizations-serializer', function () {
  describe('#serialize', function () {
    it('should convert a target profile detach organizations object to JSON API data', function () {
      const json = serializer.serialize({
        targetProfileId: 1,
        detachedOrganizationIds: [1, 5],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'target-profile-detach-organizations',
          id: '1',
          attributes: {
            'detached-organization-ids': [1, 5],
          },
        },
      });
    });
  });
});
