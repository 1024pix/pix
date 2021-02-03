const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-overview-serializer');
const CampaignParticipationOverview = require('../../../../../lib/domain/read-models/CampaignParticipationOverview');

describe('Unit | Serializer | JSONAPI | campaign-participation-overview-serializer', function() {

  describe('#serialize', function() {
    const campaignParticipationOverview = new CampaignParticipationOverview({
      id: 5,
      isShared: true,
      sharedAt: new Date('2018-02-06T14:12:44Z'),
      createdAt: new Date('2018-02-05T14:12:44Z'),
      validatedSkillsCount: 1,
      totalSkillsCount: 2,
      organizationName: 'My organization',
      assessmentState: 'started',
      campaignCode: '1234',
      campaignTitle: 'My campaign',
    });

    let expectedSerializedCampaignParticipationOverview;

    beforeEach(() => {
      expectedSerializedCampaignParticipationOverview = {
        data: {
          type: 'campaign-participation-overviews',
          id: '5',
          attributes: {
            'is-shared': true,
            'shared-at': new Date('2018-02-06T14:12:44Z'),
            'created-at': new Date('2018-02-05T14:12:44Z'),
            'organization-name': 'My organization',
            'assessment-state': 'started',
            'campaign-code': '1234',
            'campaign-title': 'My campaign',
            'mastery-percentage': 50,
          },
        },
      };
    });

    it('should convert a CampaignParticipation model object into JSON API data', function() {
      // when
      const json = serializer.serialize(campaignParticipationOverview);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipationOverview);
    });
  });

  describe('#serializeForPaginatedList', function() {

    it('should call serialize method by destructuring passed parameter', function() {
      // given
      const campaignParticipationOverviews = [
        new CampaignParticipationOverview({
          id: 6,
          isShared: true,
          sharedAt: new Date('2018-02-07T17:15:44Z'),
          createdAt: new Date('2018-02-06T17:15:44Z'),
          organizationName: 'My organization 1',
          assessmentState: 'started',
          campaignCode: '4567',
          campaignTitle: 'My campaign 1',
        }),
        new CampaignParticipationOverview({
          id: 7,
          isShared: true,
          sharedAt: new Date('2018-02-10T17:30:44Z'),
          createdAt: new Date('2018-02-09T13:15:44Z'),
          organizationName: 'My organization 2',
          assessmentState: 'started',
          campaignCode: '4567',
          campaignTitle: 'My campaign 2',
        }),
      ];
      const pagination = {
        page: {
          number: 1,
          pageSize: 2,
        },
      };
      const parameters = { campaignParticipationOverviews, pagination };

      // when
      const result = serializer.serializeForPaginatedList(parameters);

      // then
      expect(result).to.deep.equal({
        data: [
          {
            attributes: {
              'assessment-state': 'started',
              'campaign-code': '4567',
              'campaign-title': 'My campaign 1',
              'created-at': new Date('2018-02-06T17:15:44Z'),
              'is-shared': true,
              'organization-name': 'My organization 1',
              'shared-at': new Date('2018-02-07T17:15:44Z'),
              'mastery-percentage': null,
            },
            id: '6',
            type: 'campaign-participation-overviews',
          },
          {
            attributes: {
              'assessment-state': 'started',
              'campaign-code': '4567',
              'campaign-title': 'My campaign 2',
              'created-at': new Date('2018-02-09T13:15:44Z'),
              'is-shared': true,
              'organization-name': 'My organization 2',
              'shared-at': new Date('2018-02-10T17:30:44Z'),
              'mastery-percentage': null,
            },
            id: '7',
            type: 'campaign-participation-overviews',
          },
        ],
        meta: {
          page: {
            number: 1,
            pageSize: 2,
          },
        },
      });
    });
  });
});
