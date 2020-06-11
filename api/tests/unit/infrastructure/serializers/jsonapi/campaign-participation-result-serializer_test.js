const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-result-serializer');

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

      const campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
        isCompleted: true,
        testedSkillsCount,
        totalSkillsCount,
        validatedSkillsCount,
        competenceResults,
        partnerCompetenceResults: partnerCompetenceResults,
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
            badges: {
              data: null
            },
            'partner-competence-results': {
              data: [ {
                id: '12',
                type: 'partnerCompetenceResults'
              }],
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
              'area-color': 'emerald',
              name: 'Pix Emploi',
              'mastery-percentage': 33,
              'tested-skills-count': 2,
              'total-skills-count': 3,
              'validated-skills-count': 1,
            },
            id: '12',
            type: 'partnerCompetenceResults',
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
