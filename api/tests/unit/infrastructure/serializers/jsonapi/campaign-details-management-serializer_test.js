const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-details-management-serializer');

describe('Unit | Serializer | JSONAPI | campaign-details-management-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Campaign Detail Management model object into JSON API data', function() {
      // given
      const campaignManagement = {
        id: 'campaign_management_id',
        name: 'campaign',
        code: '123',
        type: 'ASSESSEMENT',
        archivedAt: new Date('2020-10-10'),
        createdAt: new Date('2020-10-10'),
        creatorFirstName: 'Ned',
        creatorLastName: 'Stark',
        organizationId: 123,
        organizationName: 'Orga',
        targetProfileId: 123,
        targetProfileName: 'TP',
      };

      // when
      const json = serializer.serialize(campaignManagement);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'campaigns',
          id: campaignManagement.id.toString(),
          attributes: {
            code: campaignManagement.code,
            name: campaignManagement.name,
            type: campaignManagement.type,
            'archived-at': campaignManagement.archivedAt,
            'created-at': campaignManagement.createdAt,
            'creator-first-name': campaignManagement.creatorFirstName,
            'creator-last-name': campaignManagement.creatorLastName,
            'organization-id': campaignManagement.organizationId,
            'organization-name': campaignManagement.organizationName,
            'target-profile-id': campaignManagement.targetProfileId,
            'target-profile-name': campaignManagement.targetProfileName,
          },
        },
      });
    });
  });
});
