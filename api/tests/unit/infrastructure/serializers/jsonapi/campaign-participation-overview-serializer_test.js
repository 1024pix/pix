const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-overview-serializer');
const CampaignParticipationOverview = require('../../../../../lib/domain/read-models/CampaignParticipationOverview');
const Stage = require('../../../../../lib/domain/models/Stage');
const Skill = require('../../../../../lib/domain/models/Skill');
const TargetProfileWithLearningContent = require('../../../../../lib/domain/models/TargetProfileWithLearningContent');

describe('Unit | Serializer | JSONAPI | campaign-participation-overview-serializer', function() {

  describe('#serialize', function() {
    const stage1 = new Stage({
      threshold: 0,
    });
    const stage2 = new Stage({
      threshold: 30,
    });
    const stage3 = new Stage({
      threshold: 70,
    });
    const targetProfile = new TargetProfileWithLearningContent({ stages: [stage1, stage2, stage3], skills: [new Skill(), new Skill()] });
    const campaignParticipationOverview = new CampaignParticipationOverview({
      id: 5,
      isShared: true,
      sharedAt: new Date('2018-02-06T14:12:44Z'),
      createdAt: new Date('2018-02-05T14:12:44Z'),
      validatedSkillsCount: 1,
      organizationName: 'My organization',
      assessmentState: 'started',
      campaignCode: '1234',
      campaignTitle: 'My campaign',
      campaignArchivedAt: new Date('2021-01-01'),
      targetProfile,
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
            'campaign-archived-at': new Date('2021-01-01'),
            'mastery-percentage': 50,
            'validated-stages-count': 2,
            'total-stages-count': 3,
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
      const targetProfile = new TargetProfileWithLearningContent({ skills: [new Skill(), new Skill()] });
      const campaignParticipationOverviews = [
        new CampaignParticipationOverview({
          id: 6,
          isShared: false,
          sharedAt: new Date('2018-02-07T17:15:44Z'),
          createdAt: new Date('2018-02-06T17:15:44Z'),
          organizationName: 'My organization 1',
          assessmentState: 'started',
          campaignCode: '4567',
          campaignTitle: 'My campaign 1',
          campaignArchivedAt: null,
          targetProfile,
        }),
        new CampaignParticipationOverview({
          id: 7,
          isShared: false,
          sharedAt: new Date('2018-02-10T17:30:44Z'),
          createdAt: new Date('2018-02-09T13:15:44Z'),
          organizationName: 'My organization 2',
          assessmentState: 'started',
          campaignCode: '4567',
          campaignTitle: 'My campaign 2',
          campaignArchivedAt: null,
          targetProfile,
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
              'is-shared': false,
              'organization-name': 'My organization 1',
              'shared-at': new Date('2018-02-07T17:15:44Z'),
              'mastery-percentage': null,
              'campaign-archived-at': null,
              'validated-stages-count': null,
              'total-stages-count': 0,
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
              'is-shared': false,
              'organization-name': 'My organization 2',
              'shared-at': new Date('2018-02-10T17:30:44Z'),
              'mastery-percentage': null,
              'campaign-archived-at': null,
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
