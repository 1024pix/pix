const { expect, factory } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const CampaignParticipation  = require('../../../../../lib/domain/models/CampaignParticipation');

describe('Unit | Serializer | JSONAPI | campaign-participation-serializer', function() {

  describe('#serialize', function() {

    it('should convert a CampaignParticipation model object into JSON API data', function() {
      // given
      const campaign = factory.buildCampaign();
      const campaignParticipation = factory.buildCampaignParticipation({
        id: 5,
        isShared: true,
        sharedAt: '2018-02-06 14:12:44',
        createdAt: '2018-02-05 14:12:44',
        campaign: campaign,
        campaignId: campaign.id,
        assessmentId: 67890,
      });

      const expectedSerializedCampaignParticipation = {
        data: {
          type: 'campaign-participations',
          id: 5,
          attributes: {
            'is-shared': true,
            'shared-at': '2018-02-06 14:12:44',
            'created-at': '2018-02-05 14:12:44',
          },
          relationships: {
            assessment: {
              data: {
                id: '67890',
                type: 'assessments'
              }
            },
            campaign: {
              data: {
                id: `${ campaign.id }`,
                type: 'campaigns'
              }
            }
          },
        },
        included: [
          {
            attributes: {
              code: campaign.code,
              title: campaign.title,
            },
            id: `${ campaign.id }`,
            type: 'campaigns'
          }
        ]
      };

      // when
      const json = serializer.serialize(campaignParticipation);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipation);
    });

  });

  describe('#deserialize', function() {

    it('should convert JSON API campaign participation data into a CampaignParticipation model', function() {
      // given
      const campaignId = '28346762';
      const jsonAnswer = {
        data: {
          type: 'campaign-participations',
          attributes: {
            participantExternalId: 'azerty@qwerty.net',
          },
          relationships: {
            'campaign': {
              data: {
                id: campaignId,
              }
            }
          }
        }
      };

      // when
      const promise = serializer.deserialize(jsonAnswer);

      // then
      return expect(promise).to.be.fulfilled
        .then((campaignParticipation) => {
          expect(campaignParticipation).to.be.instanceOf(CampaignParticipation);
          expect(campaignParticipation.participantExternalId).to.equal(jsonAnswer.data.attributes.participantExternalId);
          expect(campaignParticipation.campaignId).to.equal(campaignId);
        });
    });

  });

});
