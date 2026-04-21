import sinon from 'sinon';

import { UserTeamsInfo } from '../../../../../src/team/application/api/models/user-teams-info.js';
import { getUserTeamsInfo } from '../../../../../src/team/application/api/user-teams.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Team | Unit | Application | API | user-teams', function () {
  describe('#getUserTeamsInfo', function () {
    it("returns user's teams access", async function () {
      // given
      const userId = 1;
      const userTeamsInfo = { isPixAgent: true, isOrganizationMember: true, isCertificationCenterMember: true };
      const getUserTeamsInfoStub = sinon.stub(usecases, 'getUserTeamsInfo').resolves(userTeamsInfo);

      // when
      const result = await getUserTeamsInfo(userId);

      // then
      expect(result).to.deep.equal(new UserTeamsInfo(userTeamsInfo));
      expect(getUserTeamsInfoStub).to.have.been.calledOnceWith({ userId });
    });

    it('throws a "TypeError" when "userId" is not defined', async function () {
      // given
      const getUserTeamsInfoStub = sinon.stub(usecases, 'getUserTeamsInfo');

      // when
      const error = await catchErr(getUserTeamsInfo)(undefined);

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(getUserTeamsInfoStub).to.not.have.been.called;
    });
  });
});
