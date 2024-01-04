import { expect, sinon } from '../../../../test-helper.js';
import { updateAutonomousCourse } from '../../../../../src/evaluation/domain/usecases/update-autonomous-course.js';

describe('Unit | Domain | Use Cases | update-autonomous-course', function () {
  describe('#updateAutonomousCourse', function () {
    it('should call autonomousCourseRepository #update', async function () {
      // given
      const autonomousCourse = Symbol('autonomousCourse');
      const autonomousCourseRepositoryStub = {
        update: sinon.stub().resolves(),
      };

      // when
      await updateAutonomousCourse({
        autonomousCourse,
        autonomousCourseRepository: autonomousCourseRepositoryStub,
      });

      // then
      expect(autonomousCourseRepositoryStub.update).to.have.been.calledOnceWithExactly({ autonomousCourse });
    });
  });
});
