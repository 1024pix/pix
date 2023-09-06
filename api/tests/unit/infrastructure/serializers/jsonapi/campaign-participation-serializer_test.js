import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import { CampaignParticipation, CampaignParticipationStatuses } from '../../../../../lib/domain/models/index.js';
const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-participation-serializer', function () {
  describe('#serialize', function () {
    const campaign = { id: 1, code: 'LJA123', title: 'Désobéir' };
    const campaignParticipation = new CampaignParticipation({
      id: 5,
      status: SHARED,
      participantExternalId: 'mail pro',
      sharedAt: new Date('2018-02-06T14:12:44Z'),
      deletedAt: new Date('2018-02-06T14:12:44Z'),
      createdAt: new Date('2018-02-05T14:12:44Z'),
      campaign,
      assessments: [{ id: 4, createdAt: new Date('2018-02-06T14:12:44Z') }],
    });

    let expectedSerializedCampaignParticipation;

    beforeEach(function () {
      expectedSerializedCampaignParticipation = {
        data: {
          type: 'campaign-participations',
          id: '5',
          attributes: {
            'is-shared': true,
            'participant-external-id': 'mail pro',
            'shared-at': new Date('2018-02-06T14:12:44Z'),
            'deleted-at': new Date('2018-02-06T14:12:44Z'),
            'created-at': new Date('2018-02-05T14:12:44Z'),
          },
          relationships: {
            campaign: {
              data: {
                id: campaign.id.toString(),
                type: 'campaigns',
              },
            },
            assessment: {
              links: {
                related: `/api/assessments/${campaignParticipation.lastAssessment.id}`,
              },
            },
            trainings: {
              links: {
                related: `/api/campaign-participations/${campaignParticipation.id}/trainings`,
              },
            },
          },
        },
        included: [
          {
            attributes: {
              code: campaign.code,
              title: campaign.title,
            },
            id: campaign.id.toString(),
            type: 'campaigns',
          },
        ],
      };
    });

    it('should convert a CampaignParticipation model object into JSON API data', function () {
      // when
      const json = serializer.serialize(campaignParticipation);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipation);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API campaign participation data into a CampaignParticipation model', async function () {
      // given
      const campaignId = '28346762';
      const jsonAnswer = {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': 'azerty@qwerty.net',
            'is-reset': true,
          },
          relationships: {
            campaign: {
              data: {
                id: campaignId.toString(),
              },
            },
          },
        },
      };

      // when
      const campaignParticipation = await serializer.deserialize(jsonAnswer);

      // then
      expect(campaignParticipation).to.be.instanceOf(CampaignParticipation);
      expect(campaignParticipation.participantExternalId).to.equal(
        jsonAnswer.data.attributes['participant-external-id'],
      );
      expect(campaignParticipation.isReset).to.equal(true);
      expect(campaignParticipation.campaign.id).to.equal(campaignId);
    });
  });
});
