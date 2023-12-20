import { catchErr, expect, sinon } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { getAutonomousCourse } from '../../../../../src/evaluation/domain/usecases/get-autonomous-course.js';

describe('Unit | UseCase | get-autonomous-course', function () {
  let autonomousCourseRepository;

  beforeEach(function () {
    autonomousCourseRepository = {
      get: sinon.stub(),
    };
  });

  context('when the autonomous course exists', function () {
    it('should return an existing autonomous course', async function () {
      // given
      const autonomousCourseId = 1;
      const autonomousCourseToFind = Symbol('existing-autonomous-course');
      autonomousCourseRepository.get.withArgs({ autonomousCourseId }).resolves(autonomousCourseToFind);

      // when
      const autonomousCourse = await getAutonomousCourse({ autonomousCourseId, autonomousCourseRepository });

      // then
      expect(autonomousCourse).to.equal(autonomousCourseToFind);
    });
  });

  context('when the autonomous course does not exist', function () {
    it('should throw an error', async function () {
      // given
      const autonomousCourseId = 123;

      // when
      const error = await catchErr(getAutonomousCourse)({ autonomousCourseId, autonomousCourseRepository });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal(`No autonomous-course found with id ${autonomousCourseId}`);
    });
  });
});
