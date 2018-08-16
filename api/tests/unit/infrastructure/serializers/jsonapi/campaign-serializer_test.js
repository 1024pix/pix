const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const Campaign  = require('../../../../../lib/domain/models/Campaign');

describe('Unit | Serializer | JSONAPI | campaign-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Campaign model object into JSON API data', function() {
      // given
      const campaign = new Campaign({
        id: 5,
        name: 'My zuper organization',
        code: 'ATDGER342',
        createdAt: '2018-02-06 14:12:44',
        creatorId: 3453,
        organizationId: 10293,
      });

      const expectedSerializedCampaign = {
        data: {
          type: 'campaigns',
          id: 5,
          attributes: {
            name: 'My zuper organization',
            code: 'ATDGER342',
            'created-at': '2018-02-06 14:12:44',
          },
        }
      };

      // when
      const json = serializer.serialize(campaign);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaign);
    });

  });

  describe('#deserialize', function() {

    it('should convert JSON API campaign data into a Campaign model object', function() {
      // given
      const organizationId = 10293;
      const targetProfileId = '23';
      const jsonAnswer = {
        data: {
          type: 'campaign',
          attributes: {
            name: 'My zuper organization',
            'organization-id': organizationId,
          },
          relationships: {
            'target-profile': {
              data: {
                id: targetProfileId
              }
            }
          }
        }
      };

      // when
      const campaign = serializer.deserialize(jsonAnswer);

      // then
      expect(campaign.name).to.equal(jsonAnswer.data.attributes.name);
      expect(campaign.organizationId).to.equal(organizationId);
      expect(campaign.targetProfileId).to.equal(targetProfileId);
    });

  });

});
