const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const CampaignParticipation = require('../../../../../lib/domain/models/CampaignParticipation');

describe('Unit | Serializer | JSONAPI | campaign-participation-serializer', function() {

  describe('#serialize', function() {

    const campaign = { id: 1, code: 'LJA123', title: 'Désobéir' };
    const user = { id: 1, firstName: 'Michel', lastName: 'Essentiel' };
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
      }
    ];
    const partnerCompetenceResults = [
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
      }
    ];
    const campaignParticipationResult = {
      id: 1,
      isCompleted: true,
      masteryPercentage: 40,
      totalSkillsCount: 10,
      testedSkillsCount: 5,
      validatedSkillsCount: 4,
      progress: 1,
      competenceResults,
      partnerCompetenceResults: partnerCompetenceResults,
    };
    const campaignAnalysis = {};
    const campaignParticipation = new CampaignParticipation({
      id: 5,
      isShared: true,
      participantExternalId: 'mail pro',
      sharedAt: new Date('2018-02-06T14:12:44Z'),
      createdAt: new Date('2018-02-05T14:12:44Z'),
      campaign,
      assessments: [{ id: 4, createdAt: new Date('2018-02-06T14:12:44Z') }],
      campaignParticipationResult,
      user,
      campaignAnalysis,
    });

    let expectedSerializedCampaignParticipation;

    beforeEach(() => {
      expectedSerializedCampaignParticipation = {
        data: {
          type: 'campaign-participations',
          id: '5',
          attributes: {
            'is-shared': true,
            'participant-external-id': 'mail pro',
            'shared-at': new Date('2018-02-06T14:12:44Z'),
            'created-at': new Date('2018-02-05T14:12:44Z'),
          },
          relationships: {
            campaign: {
              data: {
                id: `${ campaign.id }`,
                type: 'campaigns'
              }
            },
            user: {
              data: {
                id: user.id.toString(),
                type: 'users',
              }
            },
            assessment: {
              links: {
                related: `/api/assessments/${campaignParticipation.lastAssessment.id}`
              }
            },
            'campaign-analysis': {
              links: {
                related: '/api/campaign-participations/5/analyses'
              }
            },
            'campaign-participation-result': {
              links: {
                'related': '/api/campaign-participations/5/campaign-participation-result'
              }
            },
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
          },
          {
            attributes: {
              'first-name': 'Michel',
              'last-name': 'Essentiel',
            },
            id: user.id.toString(),
            type: 'users'
          },
          {
            attributes: {
              'mastery-percentage': 40,
              'tested-skills-count': 5,
              'total-skills-count': 10,
              'validated-skills-count': 4,
            },
            id: '1',
            type: 'competenceResults'
          },
          {
            attributes: {
              'mastery-percentage': 33,
              'tested-skills-count': 5,
              'total-skills-count': 6,
              'validated-skills-count': 2,
            },
            id: '2',
            type: 'competenceResults'
          },
          {
            attributes: {
              'mastery-percentage': 50,
              'tested-skills-count': 5,
              'total-skills-count': 10,
              'validated-skills-count': 5,
            },
            id: '1',
            type: 'partnerCompetenceResults',
          },
          {
            attributes: {
              'mastery-percentage': 66,
              'tested-skills-count': 5,
              'total-skills-count': 6,
              'validated-skills-count': 4,
            },
            id: '2',
            type: 'partnerCompetenceResults'
          },
          {
            attributes: {
              id: 1,
              'is-completed': true,
              'mastery-percentage': 40,
              'tested-skills-count': 5,
              'total-skills-count': 10,
              'validated-skills-count': 4,
              'progress': 1
            },
            relationships: {
              'partner-competence-results': {
                data: [
                  {
                    id: '1',
                    type: 'partnerCompetenceResults',
                  },
                  {
                    id: '2',
                    type: 'partnerCompetenceResults'
                  }
                ]
              },
              'competence-results': {
                data: [{
                  id: '1',
                  type: 'competenceResults',
                },
                {
                  id: '2',
                  type: 'competenceResults',
                }]
              }
            },
            id: '1',
            type: 'campaignParticipationResults'
          }
        ]
      };
    });

    it('should convert a CampaignParticipation model object into JSON API data', function() {
      // when
      const json = serializer.serialize(campaignParticipation);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipation);
    });

    it('should convert a CampaignParticipation model object into JSON API data with ignoreCampaignParticipationResultsRelationshipData false', function() {
      // given
      const meta = {};
      expectedSerializedCampaignParticipation.data.relationships['campaign-participation-result'].data = {
        type: 'campaignParticipationResults',
        id: '1'
      };
      expectedSerializedCampaignParticipation = { ...expectedSerializedCampaignParticipation, meta };

      // when
      const result = serializer.serialize(campaignParticipation, meta, { ignoreCampaignParticipationResultsRelationshipData : false });

      // then
      expect(result).to.deep.equal(expectedSerializedCampaignParticipation);
    });

    it('should not serialize user if user is undefined', function() {
      // given
      campaignParticipation.user = undefined;
      delete expectedSerializedCampaignParticipation.data.relationships.user;
      expectedSerializedCampaignParticipation.included = expectedSerializedCampaignParticipation.included.filter((included) => included.type !== 'users');

      // when
      const result = serializer.serialize(campaignParticipation);

      // then
      expect(result).to.deep.equal(expectedSerializedCampaignParticipation);
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
                id: campaignId.toString(),
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
