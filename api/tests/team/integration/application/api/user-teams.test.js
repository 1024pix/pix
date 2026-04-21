import { UserTeamsInfo } from '../../../../../src/team/application/api/models/user-teams-info.js';
import { getUserTeamsInfo } from '../../../../../src/team/application/api/user-teams.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Team | Integration | Application | API | user-teams', function () {
  describe('#getUserTeamsInfo', function () {
    it("returns user's teams info", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await getUserTeamsInfo(userId);

      // then
      expect(result).to.deep.equal(
        new UserTeamsInfo({ isPixAgent: false, isOrganizationMember: false, isCertificationCenterMember: false }),
      );
    });
  });
});
