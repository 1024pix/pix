const { expect } = require('../../../../test-helper');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CampaignAssessmentParticipation = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipation');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer');

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-serializer', function() {

  describe('#serialize()', function() {

    let modelCampaignAssessmentParticipation;
    let expectedJsonApi;

    beforeEach(() => {
      const createdAt = new Date('2020-01-01');
      const sharedAt = new Date('2020-01-02');
      expectedJsonApi = {
        data: {
          type: 'campaign-assessment-participations',
          id: '1',
          attributes: {
            'first-name': 'someFirstName',
            'last-name': 'someLastName',
            'participant-external-id': 'someParticipantExternalId',
            'campaign-id': 2,
            'created-at': createdAt,
            'is-shared': true,
            'shared-at': sharedAt,
            'total-skills-count': 20,
            'validated-skills-count': 7,
            'mastery-percentage': 35,
            'progression': 100,
          },
          relationships: {
            'campaign-analysis': {
              links: {
                related: '/api/campaign-participations/1/analyses'
              }
            },
            'campaign-assessment-participation-result': {
              links: {
                'related': '/api/campaigns/2/assessment-participations/1/results'
              }
            },
          }
        }
      };

      modelCampaignAssessmentParticipation = new CampaignAssessmentParticipation({
        campaignParticipationId: 1,
        campaignId: 2,
        firstName: 'someFirstName',
        lastName: 'someLastName',
        participantExternalId: 'someParticipantExternalId',
        state: Assessment.states.COMPLETED,
        createdAt,
        isShared: true,
        sharedAt,
        totalSkillsCount: 20,
        validatedSkillsCount: 7,
        testedSkillsCount: 3,
      });
    });

    it('should convert a CampaignAssessmentParticipation model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelCampaignAssessmentParticipation);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
