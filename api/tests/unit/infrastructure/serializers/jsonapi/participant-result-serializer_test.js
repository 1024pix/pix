const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/participant-result-serializer');
const AssessmentResult = require('../../../../../lib/domain/read-models/participant-results/AssessmentResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Serializer | JSON API | participant-result-serializer', function () {
  describe('#serialize', function () {
    let assessmentResult;

    beforeEach(function () {
      const isCampaignMultipleSendings = true;
      const isOrganizationLearnerActive = true;
      const isCampaignArchived = false;
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

      const participationResults = {
        campaignParticipationId: 1,
        isCompleted: true,
        sharedAt: new Date('2020-01-01'),
        knowledgeElements: knowledgeElements,
        acquiredBadgeIds: [3],
        participantExternalId: 'greg@lafleche.fr',
        masteryRate: 0.5,
        isDeleted: false,
      };

      const competences = [
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

      const stages = [
        { id: 2, title: 'Stage1', message: 'Message1', threshold: 0 },
        { id: 3, title: 'Stage2', message: 'Message2', threshold: 50 },
        { id: 4, title: 'Stage1', message: 'Message1', threshold: 100 },
      ];
      const badgeResultsDTO = [
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

      const flashScoringResults = {
        estimatedFlashLevel: -2.4672347856,
        flashPixScore: 374.3438957781,
      };

      assessmentResult = new AssessmentResult({
        participationResults,
        competences,
        stages,
        badgeResultsDTO,
        isCampaignMultipleSendings,
        isOrganizationLearnerActive,
        isCampaignArchived,
        flashScoringResults,
      });
    });

    it('should convert a CampaignParticipationResult model object into JSON API data', function () {
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
            'estimated-flash-level': -2.4672347856,
            'flash-pix-score': 374.3438957781,
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
  });
});
