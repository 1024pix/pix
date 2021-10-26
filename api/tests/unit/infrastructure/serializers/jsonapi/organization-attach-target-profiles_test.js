const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-attach-target-profiles-serializer');

describe('Unit | Serializer | JSONAPI | organization-attach-target-profiles-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organization attach target profiles object to JSON API data', function () {
      const json = serializer.serialize({
        organizationId: 1,
        attachedIds: [1, 5],
        duplicatedIds: [8, 9],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'organization-attach-target-profiles',
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
