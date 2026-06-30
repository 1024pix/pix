import { CampaignParticipationOverview } from '../../../../../../../src/prescription/campaign-participation/domain/read-models/CampaignParticipationOverview.js';
import { campaignParticipationOverviewSerializer } from '../../../../../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/campaign-participation-overview-serializer.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../../src/prescription/shared/domain/constants.js';
import { expect } from '../../../../../../test-helper.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-participation-overview-serializer', function () {
  describe('#serialize', function () {
    let campaignParticipationOverview, expectedSerializedCampaignParticipationOverview;

    beforeEach(function () {
      campaignParticipationOverview = new CampaignParticipationOverview({
        id: 5,
        sharedAt: new Date('2018-02-06T14:12:44Z'),
        createdAt: new Date('2018-02-05T14:12:44Z'),
        organizationName: 'My organization',
        status: SHARED,
        campaignCode: '1234',
        campaignTitle: 'My campaign',
        campaignArchivedAt: new Date('2021-01-01'),
        masteryRate: 0.5,
        totalStagesCount: 3,
        validatedStagesCount: 2,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
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
            'can-retry': false,
            'campaign-type': CampaignTypes.ASSESSMENT,
          },
        },
      };
    });

    it('should convert a CampaignParticipation model object into JSON API data', function () {
      // when
      const json = campaignParticipationOverviewSerializer.serialize(campaignParticipationOverview);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipationOverview);
    });

    it('should serialize canRetry as true when retry is possible', function () {
      // given
      const campaignParticipationOverview = new CampaignParticipationOverview({
        id: 6,
        status: SHARED,
        sharedAt: new Date('2018-01-01T14:12:44Z'), // Old enough
        masteryRate: 0.7, // Less than 100%
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const json = campaignParticipationOverviewSerializer.serialize(campaignParticipationOverview);

      // then
      expect(json.data.attributes['can-retry']).to.be.true;
    });

    it('should serialize canRetry as false when retry is not possible', function () {
      // given
      const campaignParticipationOverview = new CampaignParticipationOverview({
        id: 7,
        status: SHARED,
        sharedAt: new Date('2018-01-01T14:12:44Z'),
        masteryRate: 0.7,
        isCampaignMultipleSendings: false, // Multiple sendings not allowed
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const json = campaignParticipationOverviewSerializer.serialize(campaignParticipationOverview);

      // then
      expect(json.data.attributes['can-retry']).to.be.false;
    });
  });
});
