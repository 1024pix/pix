import { combinedCourseController } from '../../../../src/quest/application/combined-course-controller.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Quest | Application | Controller | CombinedCourse', function () {
  describe('#getById', function () {
    it('should call getCombinedCourseByQuestId usecase with questId', async function () {
      // given
      const questId = 'questId123';
      const combinedCourse = Symbol('combinedCourse');
      const serializedCombinedCourse = Symbol('serializedCombinedCourse');
      const request = {
        params: { questId },
      };

      sinon.stub(usecases, 'getCombinedCourseByQuestId').resolves(combinedCourse);
      const combinedCourseDetailsSerializer = { serialize: sinon.stub() };
      combinedCourseDetailsSerializer.serialize.withArgs(combinedCourse).returns(serializedCombinedCourse);

      // when
      const result = await combinedCourseController.getById(request, null, { combinedCourseDetailsSerializer });

      // then
      expect(usecases.getCombinedCourseByQuestId).to.have.been.calledOnceWithExactly({ questId });
      expect(combinedCourseDetailsSerializer.serialize).to.have.been.calledOnceWithExactly(combinedCourse);
      expect(result).to.equal(serializedCombinedCourse);
    });
  });
});
