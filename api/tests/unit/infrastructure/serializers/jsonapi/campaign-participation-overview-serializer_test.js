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

});
