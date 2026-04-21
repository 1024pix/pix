import { getUserTeamsInfo } from '../../../../../src/privacy/infrastructure/repositories/user-teams-api.repository.js';

describe('Unit | Privacy | Infrastructure | Repositories | user-teams-api', function () {
  describe('#getUserTeamsInfo', function () {
    it('returns user teams information', async function () {
      // given
      const userTeamsInfo = {
        isPixAgent: false,
        isOrganizationMember: false,
        isCertificationCenterMember: false,
      };

      const dependencies = {
        userTeamsApi: {
          getUserTeamsInfo: async () => userTeamsInfo,
        },
      };

      // when
      const result = await getUserTeamsInfo({ userId: '123', dependencies });

      // then
      expect(result).to.be.deep.equal(userTeamsInfo);
    });
  });
});
