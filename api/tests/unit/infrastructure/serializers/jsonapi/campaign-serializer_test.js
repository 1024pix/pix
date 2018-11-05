const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const Campaign  = require('../../../../../lib/domain/models/Campaign');

describe('Unit | Serializer | JSONAPI | campaign-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Campaign model object into JSON API data', function() {
      // given
      const tokenToAccessToCampaign = 'token';
      const campaign = new Campaign({
        id: 5,
        name: 'My zuper campaign',
        code: 'ATDGER342',
        title: 'Parcours recherche internet',
        customLandingPageText: 'Parcours concernant la recherche internet',
        createdAt: '2018-02-06 14:12:44',
        creatorId: 3453,
        organizationId: 10293,
        idPixLabel: 'company id',
      });

      const expectedSerializedCampaign = {
        data: {
          type: 'campaigns',
          id: 5,
          attributes: {
            name: 'My zuper campaign',
            code: 'ATDGER342',
            title: 'Parcours recherche internet',
            'custom-landing-page-text': 'Parcours concernant la recherche internet',
            'created-at': '2018-02-06 14:12:44',
            'id-pix-label': 'company id',
            'token-for-campaign-results': tokenToAccessToCampaign,
          },
        }
      };

      // when
      const json = serializer.serialize(campaign, tokenToAccessToCampaign);

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
            name: 'My zuper campaign',
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
      const promise = serializer.deserialize(jsonAnswer);

      // then
      return expect(promise).to.be.fulfilled
        .then((campaign) => {
          expect(campaign).to.be.instanceOf(Campaign);
          expect(campaign.name).to.equal(jsonAnswer.data.attributes.name);
          expect(campaign.organizationId).to.equal(organizationId);
          expect(campaign.targetProfileId).to.equal(23);
        });
    });

  });

});
