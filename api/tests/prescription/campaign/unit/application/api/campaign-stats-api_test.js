import sinon from 'sinon';

import * as campaignStatsApi from '../../../../../../src/prescription/campaign/application/api/campaign-stats-api.js';
import { OrganizationStatistics } from '../../../../../../src/prescription/campaign/application/api/models/OrganizationStatistics.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | API | CampaignStats', function () {
  describe('#getOrganizationParticipantsStatistics', function () {
    it('returns the statistics for the given organization', async function () {
      // given
      const organizationId = 1;
      const expectedStats = {
        organizationId,
        totalParticipantsCount: 42,
        totalParticipantsCountByYear: [{ year: 2025, count: 42 }],
      };
      sinon
        .stub(usecases, 'getOrganizationParticipantsStatistics')
        .withArgs({ organizationId })
        .resolves(expectedStats);

      // when
      const result = await campaignStatsApi.getOrganizationParticipantsStatistics(organizationId);

      // then
      expect(result).to.be.an.instanceOf(OrganizationStatistics);
      expect(result).to.deep.equal(expectedStats);
    });
  });
});
