import * as checkUserCanManageCombinedCourse from '../../../../../src/quest/application/usecases/check-user-can-manage-combined-course.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Application | Usecases | checkUserCanManageCombinedCourse', function () {
  context('when user has membership in combined course organization', function () {
    it('should return true', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      // when
      const canManage = await checkUserCanManageCombinedCourse.execute({ userId, questId });

      // then
      expect(canManage).to.be.true;
    });
  });

  context('when user does not have membership in combined course organization', function () {
    it('should return false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const canManage = await checkUserCanManageCombinedCourse.execute({ userId, questId });

      // then
      expect(canManage).to.be.false;
    });
  });

  context('when quest is not a combined course', function () {
    it('should throw NotFoundError', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const questId = databaseBuilder.factory.buildQuest({
        code: null,
        name: 'Not a combined course',
        organizationId: null,
      }).id;
      await databaseBuilder.commit();

      // when / then
      await expect(checkUserCanManageCombinedCourse.execute({ userId, questId })).to.be.rejectedWith(
        "Le parcours combiné pour l'id",
      );
    });
  });

  context('when user has disabled membership in combined course organization', function () {
    it('should return false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
      await databaseBuilder.commit();

      // when
      const canManage = await checkUserCanManageCombinedCourse.execute({ userId, questId });

      // then
      expect(canManage).to.be.false;
    });
  });
});
