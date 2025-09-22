import * as checkAuthorizationToAccessCombinedCourseFromQuestId from '../../../../../src/quest/application/usecases/check-authorization-to-access-combined-course-from-quest-id.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Application | Usecases | checkAuthorizationToAccessCombinedCourseFromQuestId', function () {
  let userId;

  beforeEach(function () {
    userId = databaseBuilder.factory.buildUser().id;
  });

  context('when user has organization learner in combined course organization', function () {
    it('should return true', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
      await databaseBuilder.commit();

      // when
      const authorized = await checkAuthorizationToAccessCombinedCourseFromQuestId.execute({ questId, userId });

      // then
      expect(authorized).to.be.true;
    });
  });

  context('when user does not have any organization learner in combined course organization', function () {
    it('should return true when the organization has no import feature and is not managing students ', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const authorized = await checkAuthorizationToAccessCombinedCourseFromQuestId.execute({ questId, userId });

      // then
      expect(authorized).to.be.true;
    });
    it('should return false when the organization is managing students', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const authorized = await checkAuthorizationToAccessCombinedCourseFromQuestId.execute({ questId, userId });

      // then
      expect(authorized).to.be.false;
    });
    it('should return false when the organization has import feature', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: importFeature.id,
      });
      const questId = databaseBuilder.factory.buildQuestForCombinedCourse({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const authorized = await checkAuthorizationToAccessCombinedCourseFromQuestId.execute({ questId, userId });

      // then
      expect(authorized).to.be.false;
    });
  });
});
