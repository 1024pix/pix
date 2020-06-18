const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-result-serializer');
const CampaignParticipationBadge = require('../../../../../lib/domain/models/CampaignParticipationBadge');

describe('Unit | Serializer | JSON API | campaign-participation-result-serializer', function() {

  describe('#serialize', function() {

    it('should convert a CampaignParticipationResult model object into JSON API data', function() {
      // given
      const competenceResults = [
        domainBuilder.buildCompetenceResult({
          id: 1,
          name: 'Hills Handmade Cotton Computer Avon',
        }),
        domainBuilder.buildCompetenceResult({
          id: 2,
          name: 'Soap Principal Awesome',
        })
      ];
      const partnerCompetenceResults = [
        domainBuilder.buildCompetenceResult({
          id: 12,
          areaColor: 'emerald',
          index: undefined,
          name: 'Pix Emploi',
          testedSkillsCount: 2,
          totalSkillsCount: 3,
          validatedSkillsCount: 1
        })
      ];

      const testedSkillsCount = competenceResults[0].testedSkillsCount + competenceResults[1].testedSkillsCount;
      const totalSkillsCount = competenceResults[0].totalSkillsCount + competenceResults[1].totalSkillsCount;
      const validatedSkillsCount = competenceResults[0].validatedSkillsCount + competenceResults[1].validatedSkillsCount;

      const campaignParticipationBadge = new CampaignParticipationBadge({
        id: 19,
        partnerCompetenceResults,
      });
      const campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
        isCompleted: true,
        testedSkillsCount,
        totalSkillsCount,
        validatedSkillsCount,
        competenceResults,
        campaignParticipationBadges: [campaignParticipationBadge],
      });

      const expectedSerializedCampaignParticipationResult = {
        data: {
          attributes: {
            'is-completed': true,
            'mastery-percentage': 50,
            'tested-skills-count': testedSkillsCount,
            'total-skills-count': totalSkillsCount,
            'validated-skills-count': validatedSkillsCount,
            'progress': 1,
          },
          id: '1',
          relationships: {
            'campaign-participation-badges': {
              data: [{
                id: campaignParticipationBadge.id.toString(),
                type: 'campaignParticipationBadges'
              }]
            },
            'competence-results': {
              data: [
                {
                  id: competenceResults[0].id.toString(),
                  type: 'competenceResults'
                },
                {
                  id: competenceResults[1].id.toString(),
                  type: 'competenceResults'
                }
              ]
            }
          },
          type: 'campaign-participation-results'
        },
        included: [
          {
            attributes: {
              'area-color': partnerCompetenceResults[0].areaColor,
              index: partnerCompetenceResults[0].index,
              'mastery-percentage': partnerCompetenceResults[0].masteryPercentage,
              name: partnerCompetenceResults[0].name,
              'tested-skills-count': partnerCompetenceResults[0].testedSkillsCount,
              'total-skills-count': partnerCompetenceResults[0].totalSkillsCount,
              'validated-skills-count': partnerCompetenceResults[0].validatedSkillsCount,
            },
            id: partnerCompetenceResults[0].id.toString(),
            type: 'partnerCompetenceResults',
          },
          {
            attributes: {
              'alt-message': campaignParticipationBadge.altMessage,
              message: campaignParticipationBadge.message,
              title: campaignParticipationBadge.title,
              'image-url': campaignParticipationBadge.imageUrl,
              key: campaignParticipationBadge.key,
              'is-acquired': campaignParticipationBadge.isAcquired,
            },
            id: campaignParticipationBadge.id.toString(),
            type: 'campaignParticipationBadges',
            relationships: {
              'partner-competence-results': {
                data: [
                  {
                    id: partnerCompetenceResults[0].id.toString(),
                    type: 'partnerCompetenceResults'
                  }
                ]
              }
            }
          },
          {
            attributes: {
              'area-color': competenceResults[0].areaColor,
              index: competenceResults[0].index,
              name: competenceResults[0].name,
              'mastery-percentage': 50,
              'tested-skills-count': competenceResults[0].testedSkillsCount,
              'total-skills-count': competenceResults[0].totalSkillsCount,
              'validated-skills-count': competenceResults[0].validatedSkillsCount,
            },
            id: competenceResults[0].id.toString(),
            type: 'competenceResults'
          },
          {
            attributes: {
              'area-color': competenceResults[1].areaColor,
              index: competenceResults[1].index,
              name: competenceResults[1].name,
              'mastery-percentage': 50,
              'tested-skills-count': competenceResults[1].testedSkillsCount,
              'total-skills-count': competenceResults[1].totalSkillsCount,
              'validated-skills-count': competenceResults[1].validatedSkillsCount,
            },
            id: competenceResults[1].id.toString(),
            type: 'competenceResults'
          },
        ]
      };

      // when
      const json = serializer.serialize(campaignParticipationResult);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipationResult);
    });
  });

});
