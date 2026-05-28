import sinon from 'sinon';

import { organizationForAdminRepository } from '../../../../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import { expect } from '../../../../test-helper.js';

describe('Organizational-Entities | Unit | Infrastructure | repositories | organization-for-admin', function () {
  describe('#getOrganizationParticipantsStatistics', function () {
    let campaignStatsApiStub;

    beforeEach(function () {
      campaignStatsApiStub = {
        getOrganizationParticipantsStatistics: sinon.stub(),
      };
    });

    it('should return statistics for given organization id', async function () {
      //given
      const organizationId = Symbol('organizationId');
      const expectedCount = {
        totalParticipantsCount: Symbol('totalParticipantsCount'),
      };
      campaignStatsApiStub.getOrganizationParticipantsStatistics.withArgs(organizationId).resolves(expectedCount);

      //when
      const result = await organizationForAdminRepository.getOrganizationParticipantsStatistics({
        organizationId,
        campaignStatsApi: campaignStatsApiStub,
      });

      //then
      expect(result).to.equal(expectedCount);
    });
  });
});
