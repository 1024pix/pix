const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer');

describe('Unit | Serializer | JSONAPI | participation-for-campaign-management-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a participation model object into JSON API data', function () {
      // given
      const participationForCampaignManagement = domainBuilder.buildParticipationForCampaignManagement({
        id: 123,
        createdAt: new Date('2020-10-10'),
        sharedAt: new Date('2020-10-11'),
      });

      // when
      const json = serializer.serialize([participationForCampaignManagement]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'campaign-participations',
            id: participationForCampaignManagement.id.toString(),
            attributes: {
              'last-name': participationForCampaignManagement.lastName,
              'first-name': participationForCampaignManagement.firstName,
              'participant-external-id': participationForCampaignManagement.participantExternalId,
              status: participationForCampaignManagement.status,
              'created-at': participationForCampaignManagement.createdAt,
              'shared-at': participationForCampaignManagement.sharedAt,
            },
          },
        ],
      });
    });
  });
});
