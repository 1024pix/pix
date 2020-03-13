const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const CampaignParticipation = require('../../../../../lib/domain/models/CampaignParticipation');

describe('Unit | Serializer | JSONAPI | campaign-participation-serializer', function() {

  describe('#serialize', function() {

    it('should convert a CampaignParticipation model object into JSON API data', function() {
      // given
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
      const campaignParticipationResult = {
        id: 1,
        isCompleted: true,
        masteryPercentage: 40,
        totalSkillsCount: 10,
        testedSkillsCount: 5,
        validatedSkillsCount: 4,
        competenceResults
      };
      const meta = {};
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
      });

      const expectedSerializedCampaignParticipation = {
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
              id: 1,
              'is-completed': true,
              'mastery-percentage': 40,
              'tested-skills-count': 5,
              'total-skills-count': 10,
              'validated-skills-count': 4,
            },
            relationships: {
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

      const expectedRelationshipData = {
        type: 'campaignParticipationResults',
        id: '1'
      };

      // when
      const json = serializer.serialize(campaignParticipation);
      const collection = serializer.serialize(campaignParticipation, meta, { ignoreCampaignParticipationResultsRelationshipData : false });

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipation);
      expect(collection.data.relationships['campaign-participation-result'].data).to.deep.equal(expectedRelationshipData);
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
