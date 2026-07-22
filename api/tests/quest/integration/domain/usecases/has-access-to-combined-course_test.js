import sinon from 'sinon';

import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Application | Usecases | hasAccessToCombinedCourse', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when user has organization learner in combined course organization', function () {
    it('should return true', async function () {
      // given
      const code = 'COMBINIX1';
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
      await databaseBuilder.commit();

      // when
      const authorized = await usecases.hasAccessToCombinedCourse({ code, userId });

      // then
      expect(authorized).to.be.true;
    });
  });

  context('when user does not have any organization learner in combined course organization', function () {
    it('should return true when the organization has no import feature and is not managing students ', async function () {
      // given
      const code = 'COMBINIX1';
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId });
      await databaseBuilder.commit();

      // when
      const authorized = await usecases.hasAccessToCombinedCourse({ code, userId });

      // then
      expect(authorized).to.be.true;
    });
    it('should return false when the organization is managing students', async function () {
      // given
      const code = 'COMBINIX1';
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId });
      await databaseBuilder.commit();

      // when
      const authorized = await usecases.hasAccessToCombinedCourse({ code, userId });

      // then
      expect(authorized).to.be.false;
    });
    it('should return false when the organization has import feature', async function () {
      // given
      const code = 'COMBINIX1';
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: importFeature.id,
      });
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId });
      await databaseBuilder.commit();

      // when
      const authorized = await usecases.hasAccessToCombinedCourse({ code, userId });

      // then
      expect(authorized).to.be.false;
    });
  });
});
