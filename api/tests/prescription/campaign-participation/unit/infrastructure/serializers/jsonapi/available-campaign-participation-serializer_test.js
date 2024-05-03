import { AvailableCampaignParticipation } from '../../../../../../../src/prescription/campaign-participation/domain/read-models/AvailableCampaignParticipation.js';
import * as serializer from '../../../../../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/available-campaign-participation-serializer.js';
import { CampaignParticipationStatuses } from '../../../../../../../src/prescription/shared/domain/constants.js';
import { expect } from '../../../../../../test-helper.js';

const SHARED = CampaignParticipationStatuses.SHARED;

describe('Unit | Serializer | JSONAPI | campaign-participation-serializer', function () {
  describe('#serialize', function () {
    const campaignParticipation = new AvailableCampaignParticipation({
      id: 5,
      status: SHARED,
      sharedAt: new Date('2018-02-06T14:12:44Z'),
    });

    let expectedSerializedCampaignParticipation;

    beforeEach(function () {
      expectedSerializedCampaignParticipation = {
        data: {
          type: 'available-campaign-participations',
          id: '5',
          attributes: {
            status: SHARED,
            'shared-at': new Date('2018-02-06T14:12:44Z'),
          },
        },
      };
    });

    it('should convert an AvailableCampaignParticipation model object into JSON API data', function () {
      // when
      const json = serializer.serialize(campaignParticipation);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipation);
    });
  });
});
