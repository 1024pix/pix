const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-summary-serializer');

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-summary-serializer', function() {

  describe('#serializeForPaginatedList()', function() {

    it('should call serialize method by destructuring passed parameter', function() {
      // given
      const campaignAssessmentParticipationSummaries = [
        {
          campaignParticipationId: '1',
          firstName: 'John',
          lastName: 'McClane',
          participantExternalId: 'Cop',
          status: 'COMPLETED',
          masteryPercentage: '100%',
        },
        {
          campaignParticipationId: '2',
          firstName: 'Hans',
          lastName: 'Gruber',
          participantExternalId: 'Thief',
          status: 'ONGOING',
          masteryPercentage: '99%',
        }
      ];
      const pagination = {
        page: {
          number: 1,
          pageSize: 2
        }
      };
      const parameter = { campaignAssessmentParticipationSummaries, pagination };

      const resultsSerialized = serializer.serializeForPaginatedList(parameter);

      expect(resultsSerialized).to.deep.equal({
        data: [
          {
            type: 'campaign-assessment-participation-summaries',
            id: '1',
            attributes: {
              'first-name': 'John',
              'last-name': 'McClane',
              'participant-external-id': 'Cop',
              status: 'COMPLETED',
              'mastery-percentage': '100%',
            },
          },
          {
            type: 'campaign-assessment-participation-summaries',
            id: '2',
            attributes: {
              'first-name': 'Hans',
              'last-name': 'Gruber',
              'participant-external-id': 'Thief',
              status: 'ONGOING',
              'mastery-percentage': '99%',
            },
          }
        ],
        meta: {
          page: {
            number: 1,
            pageSize: 2
          }
        }
      });
    });
  });

  describe('#serialize()', function() {

    let modelCampaignAssessmentParticipationSummary;
    let expectedJsonApi;

    beforeEach(() => {
      expectedJsonApi = {
        data: {
          type: 'campaign-assessment-participation-summaries',
          id: '1',
          attributes: {
            'first-name': 'someFirstName',
            'last-name': 'someLastName',
            'participant-external-id': 'someParticipantExternalId',
            status: 'someStatus',
            'mastery-percentage': 'someMasteryPercentage',
          },
        }
      };

      modelCampaignAssessmentParticipationSummary = {
        campaignParticipationId: 1,
        firstName: 'someFirstName',
        lastName: 'someLastName',
        participantExternalId: 'someParticipantExternalId',
        status: 'someStatus',
        masteryPercentage: 'someMasteryPercentage',
      };
    });

    it('should convert a CampaignAssessmentParticipationSummary model object into JSON API data', function() {
      // given
      const meta = { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 };
      const expectedResult = Object.assign(expectedJsonApi, { meta });

      // when
      const json = serializer.serialize(modelCampaignAssessmentParticipationSummary, meta);

      // then
      expect(json).to.deep.equal(expectedResult);
    });
  });

});
