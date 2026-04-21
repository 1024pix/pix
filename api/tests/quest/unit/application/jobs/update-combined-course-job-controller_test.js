import sinon from 'sinon';

import { UpdateCombinedCourseJobController } from '../../../../../src/quest/application/jobs/update-combined-course-job-controller.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Quest | Application | Jobs | UpdateCombinedCourseJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      // given
      const handler = new UpdateCombinedCourseJobController();
      const userId = 123;
      const moduleId = 'abc';
      const combinedCourse = domainBuilder.buildCombinedCourse();
      sinon
        .stub(usecases, 'findCombinedCourseByModuleIdAndUserId')
        .withArgs({ userId, moduleId })
        .resolves([combinedCourse]);

      sinon
        .stub(usecases, 'updateCombinedCourseProgress')
        .rejects()
        .withArgs({ userId, code: combinedCourse.code })
        .resolves();

      // when
      await handler.handle({ data: { userId, moduleId } });

      // then

      expect(usecases.updateCombinedCourseProgress).to.have.been.calledOnceWithExactly({
        userId,
        code: combinedCourse.code,
      });
    });
  });
});
