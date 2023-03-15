const { expect } = require('../../../../test-helper');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CampaignParticipationStatuses = require('../../../../../lib/domain/models/CampaignParticipationStatuses');
const CampaignAssessmentParticipation = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipation');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer');

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-serializer', function () {
  describe('#serialize()', function () {
    let modelCampaignAssessmentParticipation;
    let expectedJsonApi;
    const organizationLearnerId = 1;

    describe('with badges', function () {
      beforeEach(function () {
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
              'organization-learner-id': organizationLearnerId,
              'mastery-rate': 0.35,
              progression: 1,
            },
            relationships: {
              badges: {
                data: [
                  {
                    id: '1',
                    type: 'badges',
                  },
                ],
              },
              'campaign-analysis': {
                links: {
                  related: '/api/campaign-participations/1/analyses',
                },
              },
              'campaign-assessment-participation-result': {
                links: {
                  related: '/api/campaigns/2/assessment-participations/1/results',
                },
              },
            },
          },
          included: [
            {
              id: '1',
              type: 'badges',
              attributes: {
                'alt-message': 'someAltMessage',
                'image-url': 'someImageUrl',
                title: 'someTitle',
              },
            },
          ],
        };

        modelCampaignAssessmentParticipation = new CampaignAssessmentParticipation({
          campaignParticipationId: 1,
          campaignId: 2,
          firstName: 'someFirstName',
          lastName: 'someLastName',
          participantExternalId: 'someParticipantExternalId',
          assessmentState: Assessment.states.COMPLETED,
          createdAt,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt,
          targetedSkillsCount: 20,
          testedSkillsCount: 3,
          organizationLearnerId,
          masteryRate: 0.35,
          badges: [{ id: 1, title: 'someTitle', altMessage: 'someAltMessage', imageUrl: 'someImageUrl' }],
        });
      });

      it('should convert a CampaignAssessmentParticipation model object into JSON API data', function () {
        // when
        const json = serializer.serialize(modelCampaignAssessmentParticipation);

        // then
        expect(json).to.deep.equal(expectedJsonApi);
      });
    });

    describe('without badges', function () {
      beforeEach(function () {
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
              'organization-learner-id': organizationLearnerId,
              'mastery-rate': 0.35,
              progression: 1,
            },
            relationships: {
              badges: {
                data: [],
              },
              'campaign-analysis': {
                links: {
                  related: '/api/campaign-participations/1/analyses',
                },
              },
              'campaign-assessment-participation-result': {
                links: {
                  related: '/api/campaigns/2/assessment-participations/1/results',
                },
              },
            },
          },
        };

        modelCampaignAssessmentParticipation = new CampaignAssessmentParticipation({
          campaignParticipationId: 1,
          campaignId: 2,
          firstName: 'someFirstName',
          lastName: 'someLastName',
          participantExternalId: 'someParticipantExternalId',
          assessmentState: Assessment.states.COMPLETED,
          createdAt,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt,
          organizationLearnerId,
          targetedSkillsCount: 0,
          testedSkillsCount: 0,
          masteryRate: 0.35,
        });
      });

      it('should convert a CampaignAssessmentParticipation model object into JSON API data', function () {
        // when
        const json = serializer.serialize(modelCampaignAssessmentParticipation);

        // then
        expect(json).to.deep.equal(expectedJsonApi);
      });
    });
  });
});
