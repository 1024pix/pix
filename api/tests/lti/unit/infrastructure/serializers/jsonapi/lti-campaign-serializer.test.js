import { expect } from 'chai';

import { LtiCampaign } from '../../../../../../src/lti/domain/models/LtiCampaign.js';
import { ltiCampaignSerializer } from '../../../../../../src/lti/infrastructure/serializers/jsonapi/lti-campaign-serializer.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.ts';

describe('Unit | LTI | Infrastructure | Serializer | JSONAPI | lti-campaign', function () {
  describe('#serialize', function () {
    it('should convert an LtiCampaign model object into JSON API data', function () {
      // given
      const ltiCampaigns = [
        new LtiCampaign({
          id: 1,
          code: 'code1',
          name: 'Campaign 1',
          type: CampaignTypes.ASSESSMENT,
          organizationName: 'Orga 1',
          description: 'My campaign 1 description',
        }),
        new LtiCampaign({
          id: 2,
          code: 'code2',
          name: 'Campaign 2',
          type: CampaignTypes.ASSESSMENT,
          organizationName: 'Orga 2',
          description: 'My campaign 2 description',
        }),
      ];

      // when
      const serializedLtiCampaigns = ltiCampaignSerializer.serialize(ltiCampaigns);

      // then
      expect(serializedLtiCampaigns).to.deep.equal({
        data: [
          {
            type: 'lti-campaigns',
            id: '1',
            attributes: {
              code: 'code1',
              name: 'Campaign 1',
              type: 'ASSESSMENT',
              'organization-name': 'Orga 1',
              description: 'My campaign 1 description',
            },
          },
          {
            type: 'lti-campaigns',
            id: '2',
            attributes: {
              code: 'code2',
              name: 'Campaign 2',
              type: 'ASSESSMENT',
              'organization-name': 'Orga 2',
              description: 'My campaign 2 description',
            },
          },
        ],
      });
    });
  });
});
