import { expect } from '../../../../test-helper';
import Assessment from '../../../../../lib/domain/models/Assessment';
import CampaignParticipationStatuses from '../../../../../lib/domain/models/CampaignParticipationStatuses';
import CampaignAssessmentParticipation from '../../../../../lib/domain/read-models/CampaignAssessmentParticipation';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer';

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-serializer', function () {
  describe('#serialize()', function () {
    let modelCampaignAssessmentParticipation;
    let expectedJsonApi;

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
