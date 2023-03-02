const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-overview-serializer');
const CampaignParticipationOverview = require('../../../../../lib/domain/read-models/CampaignParticipationOverview');
const CampaignParticipationStatuses = require('../../../../../lib/domain/models/CampaignParticipationStatuses');

const { SHARED, STARTED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-participation-overview-serializer', function () {
  describe('#serialize', function () {
    let campaignParticipationOverview, expectedSerializedCampaignParticipationOverview;

    beforeEach(function () {
      const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
        campaignId: 3,
        stages: [
          {
            threshold: 0,
          },
          {
            threshold: 30,
          },
          {
            threshold: 70,
          },
        ],
      });
      campaignParticipationOverview = new CampaignParticipationOverview({
        id: 5,
        sharedAt: new Date('2018-02-06T14:12:44Z'),
        createdAt: new Date('2018-02-05T14:12:44Z'),
        organizationName: 'My organization',
        status: SHARED,
        campaignCode: '1234',
        campaignTitle: 'My campaign',
        campaignArchivedAt: new Date('2021-01-01'),
        stageCollection,
        masteryRate: 0.5,
      });
      expectedSerializedCampaignParticipationOverview = {
        data: {
          type: 'campaign-participation-overviews',
          id: '5',
          attributes: {
            'is-shared': true,
            'shared-at': new Date('2018-02-06T14:12:44Z'),
            'created-at': new Date('2018-02-05T14:12:44Z'),
            'organization-name': 'My organization',
            status: SHARED,
            'campaign-code': '1234',
            'campaign-title': 'My campaign',
            'disabled-at': new Date('2021-01-01'),
            'mastery-rate': 0.5,
            'validated-stages-count': 2,
            'total-stages-count': 3,
          },
        },
      };
    });

    it('should convert a CampaignParticipation model object into JSON API data', function () {
      // when
      const json = serializer.serialize(campaignParticipationOverview);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipationOverview);
    });
  });

  describe('#serializeForPaginatedList', function () {
    it('should call serialize method by destructuring passed parameter', function () {
      // given
      const emptyStageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({ stages: [] });
      const campaignParticipationOverviews = [
        new CampaignParticipationOverview({
          id: 6,
          status: STARTED,
          sharedAt: new Date('2018-02-07T17:15:44Z'),
          createdAt: new Date('2018-02-06T17:15:44Z'),
          organizationName: 'My organization 1',
          campaignCode: '4567',
          campaignTitle: 'My campaign 1',
          campaignArchivedAt: null,
          masteryRate: null,
          stageCollection: emptyStageCollection,
        }),
        new CampaignParticipationOverview({
          id: 7,
          status: STARTED,
          sharedAt: new Date('2018-02-10T17:30:44Z'),
          createdAt: new Date('2018-02-09T13:15:44Z'),
          organizationName: 'My organization 2',
          campaignCode: '4567',
          campaignTitle: 'My campaign 2',
          campaignArchivedAt: null,
          masteryRate: null,
          stageCollection: emptyStageCollection,
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
              status: STARTED,
              'campaign-code': '4567',
              'campaign-title': 'My campaign 1',
              'created-at': new Date('2018-02-06T17:15:44Z'),
              'is-shared': false,
              'organization-name': 'My organization 1',
              'shared-at': new Date('2018-02-07T17:15:44Z'),
              'mastery-rate': null,
              'disabled-at': null,
              'validated-stages-count': null,
              'total-stages-count': 0,
            },
            id: '6',
            type: 'campaign-participation-overviews',
          },
          {
            attributes: {
              status: STARTED,
              'campaign-code': '4567',
              'campaign-title': 'My campaign 2',
              'created-at': new Date('2018-02-09T13:15:44Z'),
              'is-shared': false,
              'organization-name': 'My organization 2',
              'shared-at': new Date('2018-02-10T17:30:44Z'),
              'mastery-rate': null,
              'disabled-at': null,
              'validated-stages-count': null,
              'total-stages-count': 0,
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
