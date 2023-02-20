import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-management-serializer';

describe('Unit | Serializer | JSONAPI | campaign-management-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Campaign-Management model object into JSON API data', function () {
      // given
      const campaignManagement = domainBuilder.buildCampaignManagement({
        id: 'campaign_management_id',
        archivedAt: new Date('2020-10-10'),
      });

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
            'creator-id': campaignManagement.creatorId,
            'creator-first-name': campaignManagement.creatorFirstName,
            'creator-last-name': campaignManagement.creatorLastName,
            'owner-id': campaignManagement.ownerId,
            'owner-first-name': campaignManagement.ownerFirstName,
            'owner-last-name': campaignManagement.ownerLastName,
          },
        },
      });
    });
  });
});
