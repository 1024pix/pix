const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/participant-result-serializer');
const AssessmentResult = require('../../../../../lib/domain/read-models/participant-results/AssessmentResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Serializer | JSON API | participant-result-serializer', function () {
  describe('#serialize', function () {
    const isCampaignMultipleSendings = true;
    const isOrganizationLearnerActive = true;
    const isCampaignArchived = false;
    let participationResults;
    let competences;
    let stages;
    let badgeResultsDTO;

    beforeEach(function () {
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({
          skillId: 'skill1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        }),
        domainBuilder.buildKnowledgeElement({
          skillId: 'skill2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        }),
      ];

      participationResults = {
        campaignParticipationId: 1,
        isCompleted: true,
        sharedAt: new Date('2020-01-01'),
        knowledgeElements: knowledgeElements,
        acquiredBadgeIds: [3],
        participantExternalId: 'greg@lafleche.fr',
        masteryRate: 0.5,
        isDeleted: false,
      };

      competences = [
        {
          competence: domainBuilder.buildCompetence({
            id: 'C1',
            name: 'Competence1',
            index: '1.1',
          }),
          area: domainBuilder.buildArea({
            name: 'AreaName',
            color: 'AreaColor',
          }),
          targetedSkillIds: ['skill1', 'skill2'],
        },
      ];

      stages = [
        { id: 2, title: 'Stage1', message: 'Message1', threshold: 0 },
        { id: 3, title: 'Stage2', message: 'Message2', threshold: 50 },
        { id: 4, title: 'Stage1', message: 'Message1', threshold: 100 },
      ];

      badgeResultsDTO = [
        {
          id: 3,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          badgeCompetences: [{ id: 31, name: 'BadgeC1', color: 'BadgeColor', skillIds: ['skill1'] }],
          isAlwaysVisible: true,
          isCertifiable: false,
          isValid: true,
        },
      ];
    });

    it('should convert a CampaignParticipationResult model object into JSON API data', function () {
      // given
      const assessmentResult = new AssessmentResult({
        participationResults,
        competences,
        stages,
        badgeResultsDTO,
        isCampaignMultipleSendings,
        isOrganizationLearnerActive,
        isCampaignArchived,
      });

      const expectedSerializedCampaignParticipationResult = {
        data: {
          attributes: {
            'is-completed': true,
            'is-shared': true,
            'mastery-rate': 0.5,
            'tested-skills-count': 2,
            'total-skills-count': 2,
            'validated-skills-count': 1,
            'stage-count': 3,
            'can-retry': true,
            'can-improve': false,
            'is-disabled': false,
            'participant-external-id': 'greg@lafleche.fr',
          },
          id: '1',
          relationships: {
            'campaign-participation-badges': {
              data: [
                {
                  id: '3',
                  type: 'campaignParticipationBadges',
                },
              ],
            },
            'competence-results': {
              data: [
                {
                  id: 'C1',
                  type: 'competenceResults',
                },
              ],
            },
            'reached-stage': {
              data: {
                id: '3',
                type: 'reached-stages',
              },
            },
          },
          type: 'campaign-participation-results',
        },
        included: [
          {
            attributes: {
              'area-color': undefined,
              'mastery-percentage': 100,
              name: 'BadgeC1',
              'tested-skills-count': 1,
              'total-skills-count': 1,
              'validated-skills-count': 1,
            },
            id: '31',
            type: 'skillSetResults',
          },
          {
            attributes: {
              'area-color': undefined,
              'mastery-percentage': 100,
              name: 'BadgeC1',
              'tested-skills-count': 1,
              'total-skills-count': 1,
              'validated-skills-count': 1,
            },
            id: '31',
            type: 'partnerCompetenceResults',
          },
          {
            attributes: {
              'alt-message': 'Badge2 AltMessage',
              message: 'Badge2 Message',
              title: 'Badge2 Title',
              'image-url': 'Badge2 ImgUrl',
              key: 'Badge2 Key',
              'is-acquired': true,
              'is-always-visible': true,
              'is-certifiable': false,
              'is-valid': true,
            },
            id: '3',
            type: 'campaignParticipationBadges',
            relationships: {
              'skill-set-results': {
                data: [
                  {
                    id: '31',
                    type: 'skillSetResults',
                  },
                ],
              },
              'partner-competence-results': {
                data: [
                  {
                    id: '31',
                    type: 'partnerCompetenceResults',
                  },
                ],
              },
            },
          },
          {
            attributes: {
              'area-color': 'AreaColor',
              index: '1.1',
              name: 'Competence1',
              'mastery-percentage': 50,
              'tested-skills-count': 2,
              'total-skills-count': 2,
              'validated-skills-count': 1,
            },
            id: 'C1',
            type: 'competenceResults',
          },
          {
            attributes: {
              title: 'Stage2',
              message: 'Message2',
              threshold: 50,
              'star-count': 2,
            },
            id: '3',
            type: 'reached-stages',
          },
        ],
      };

      // when
      const json = serializer.serialize(assessmentResult);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipationResult);
    });

    context('when campaign is FLASH', function () {
      it('should return flash results', async function () {
        // given
        const flashScoringResults = {
          estimatedLevel: -2.4672347856,
          pixScore: 374.3438957781,
          competencesWithPixScore: [],
        };

        const assessmentResult = new AssessmentResult({
          participationResults,
          competences: [],
          stages,
          badgeResultsDTO,
          isCampaignMultipleSendings,
          isOrganizationLearnerActive,
          isCampaignArchived,
          flashScoringResults,
        });

        // when
        const json = serializer.serialize(assessmentResult);

        // then
        expect(json.data.attributes).to.have.property('estimated-flash-level', -2.4672347856);
        expect(json.data.attributes).to.have.property('flash-pix-score', 374.3438957781);
      });
    });
  });
});
