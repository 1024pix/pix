import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer';
import CampaignParticipation from '../../../../../lib/domain/models/CampaignParticipation';
import CampaignParticipationStatuses from '../../../../../lib/domain/models/CampaignParticipationStatuses';
const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-participation-serializer', function () {
  describe('#serialize', function () {
    const campaign = { id: 1, code: 'LJA123', title: 'Désobéir' };
    const competenceResults = [
      {
        id: '1',
        isCompleted: true,
        masteryPercentage: 40,
        testedSkillsCount: 5,
        totalSkillsCount: 10,
        validatedSkillsCount: 4,
      },
      {
        id: '2',
        isCompleted: true,
        masteryPercentage: 33,
        testedSkillsCount: 5,
        totalSkillsCount: 6,
        validatedSkillsCount: 2,
      },
    ];
    const skillSetResults = [
      {
        id: '1',
        isCompleted: true,
        masteryPercentage: 50,
        testedSkillsCount: 5,
        totalSkillsCount: 10,
        validatedSkillsCount: 5,
      },
      {
        id: '2',
        isCompleted: true,
        masteryPercentage: 66,
        testedSkillsCount: 5,
        totalSkillsCount: 6,
        validatedSkillsCount: 4,
      },
    ];
    const campaignParticipationBadge = {
      id: 5,
      skillSetResults: skillSetResults,
    };
    const campaignParticipationResult = {
      id: 1,
      isCompleted: true,
      masteryPercentage: 40,
      totalSkillsCount: 10,
      testedSkillsCount: 5,
      validatedSkillsCount: 4,
      progress: 1,
      competenceResults,
      campaignParticipationBadges: [campaignParticipationBadge],
    };
    const campaignAnalysis = {};
    const campaignParticipation = new CampaignParticipation({
      id: 5,
      status: SHARED,
      participantExternalId: 'mail pro',
      sharedAt: new Date('2018-02-06T14:12:44Z'),
      deletedAt: new Date('2018-02-06T14:12:44Z'),
      createdAt: new Date('2018-02-05T14:12:44Z'),
      campaign,
      assessments: [{ id: 4, createdAt: new Date('2018-02-06T14:12:44Z') }],
      campaignParticipationResult,
      campaignAnalysis,
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
    it('should convert JSON API campaign participation data into a CampaignParticipation model', function () {
      // given
      const campaignId = '28346762';
      const jsonAnswer = {
        data: {
          type: 'campaign-participations',
          attributes: {
            participantExternalId: 'azerty@qwerty.net',
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
      const promise = serializer.deserialize(jsonAnswer);

      // then
      return expect(promise).to.be.fulfilled.then((campaignParticipation) => {
        expect(campaignParticipation).to.be.instanceOf(CampaignParticipation);
        expect(campaignParticipation.participantExternalId).to.equal(jsonAnswer.data.attributes.participantExternalId);
        expect(campaignParticipation.campaign.id).to.equal(campaignId);
      });
    });
  });
});
