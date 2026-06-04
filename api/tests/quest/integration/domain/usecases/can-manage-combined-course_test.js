import sinon from 'sinon';

import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Integration | Application | Usecases | canManageCombinedCourse', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when user has membership in combined course organization', function () {
    it('should return true', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({ organizationId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      // when
      const canManage = await usecases.canManageCombinedCourse({ userId, combinedCourseId });

      // then
      expect(canManage).to.be.true;
    });
  });

  context('when user does not have membership in combined course organization', function () {
    it('should return false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const canManage = await usecases.canManageCombinedCourse({ userId, combinedCourseId });

      // then
      expect(canManage).to.be.false;
    });
  });

  context('when combined course does not exist', function () {
    it('should throw NotFoundError', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when / then
      const error = await catchErr(usecases.canManageCombinedCourse)({ userId, combinedCourseId: 12 });
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when user has disabled membership in combined course organization', function () {
    it('should return false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({ organizationId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
      await databaseBuilder.commit();

      // when
      const canManage = await usecases.canManageCombinedCourse({ userId, combinedCourseId });

      // then
      expect(canManage).to.be.false;
    });
  });
});
