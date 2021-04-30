const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/participant-result-serializer');
const AssessmentResult = require('../../../../../lib/domain/read-models/participant-results/AssessmentResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Serializer | JSON API | participant-result-serializer', function() {

  describe('#serialize', function() {

    let assessmentResult;

    beforeEach(() => {
      const isCampaignMultipleSendings = true;
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
      };

      const competences = [
        {
          id: 'C1',
          name: 'Competence1',
          index: '1.1',
          areaName: 'AreaName',
          areaColor: 'AreaColor',
          skillIds: ['skill1', 'skill2'],
        },
      ];

      const stages = [
        { id: 2, title: 'Stage1', message: 'Message1', threshold: 0 },
        { id: 3, title: 'Stage2', message: 'Message2', threshold: 50 },
        { id: 4, title: 'Stage1', message: 'Message1', threshold: 100 },
      ];
      const badges = [{
        id: 3,
        altMessage: 'Badge2 AltMessage',
        message: 'Badge2 Message',
        title: 'Badge2 Title',
        imageUrl: 'Badge2 ImgUrl',
        key: 'Badge2 Key',
        badgeCompetences: [{ id: 31, name: 'BadgeC1', color: 'BadgeColor', skillIds: ['skill1'] }],
      }];

      const targetProfile = { competences, stages, badges };
      assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings);
    });

    it('should convert a CampaignParticipationResult model object into JSON API data', function() {

      const expectedSerializedCampaignParticipationResult = {
        data: {
          attributes: {
            'is-completed': true,
            'mastery-percentage': 50,
            'tested-skills-count': 2,
            'total-skills-count': 2,
            'validated-skills-count': 1,
            'stage-count': 3,
            'can-retry': true,
          },
          id: '1',
          relationships: {
            'campaign-participation-badges': {
              data: [{
                id: '3',
                type: 'campaignParticipationBadges',
              }],
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
              'area-color': 'BadgeColor',
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
            },
            id: '3',
            type: 'campaignParticipationBadges',
            relationships: {
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
