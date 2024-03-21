import { CampaignAssessmentParticipationResult } from '../../../../../../../src/prescription/campaign-participation/domain/models/CampaignAssessmentParticipationResult.js';
import * as serializer from '../../../../../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer.js';
import { CampaignParticipationStatuses } from '../../../../../../../src/prescription/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-result-serializer', function () {
  describe('#serialize()', function () {
    let modelCampaignAssessmentParticipationResult;
    let expectedJsonApi;

    beforeEach(function () {
      const tube = domainBuilder.buildTube({
        id: 'recTube1',
        skills: ['oneSkill'],
      });
      const competence = domainBuilder.buildCompetence({
        id: 'competence1',
        tubes: [tube],
        areaId: 'area1',
      });
      const area = domainBuilder.buildArea({ id: 'area1', competences: [competence] });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);

      expectedJsonApi = {
        data: {
          type: 'campaign-assessment-participation-results',
          id: '1',
          attributes: {
            'campaign-id': 2,
          },
          relationships: {
            'competence-results': {
              data: [
                {
                  id: `1-${competence.id}`,
                  type: 'campaign-assessment-participation-competence-results',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'campaign-assessment-participation-competence-results',
            id: `1-${competence.id}`,
            attributes: {
              name: competence.name,
              index: competence.index,
              'competence-mastery-rate': 1,
              'area-color': area.color,
            },
          },
        ],
      };

      modelCampaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignLearningContent,
        campaignParticipationId: 1,
        campaignId: 2,
        validatedTargetedKnowledgeElementsCountByCompetenceId: { [competence.id]: 1 },
        status: SHARED,
      });
    });

    it('should convert a CampaignAssessmentParticipationResult model object into JSON API data', function () {
      // when
      const json = serializer.serialize(modelCampaignAssessmentParticipationResult);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
