import { expect, sinon } from '../../../../test-helper.js';
import { findAllPaginatedAutonomousCourses } from '../../../../../src/evaluation/domain/usecases/find-all-paginated-autonomous-courses.js';
import { constants } from '../../../../../lib/domain/constants.js';

describe('Unit | UseCase | find-all-paginated-autonomous-courses', function () {
  it('should return a paginated list of autonomous courses', async function () {
    // given
    sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

    const page = {
      size: 10,
      number: 1,
    };

    const autonomousCourses = Symbol('autonomousCourses');

    const autonomousCourseRepository = {
      findAllPaginated: sinon.stub().resolves(autonomousCourses),
    };

    // when
    const paginatedAutonomousCourses = await findAllPaginatedAutonomousCourses({
      page,
      autonomousCourseRepository,
    });

    // then
    expect(autonomousCourseRepository.findAllPaginated).to.be.calledOnceWithExactly({ page });
    expect(paginatedAutonomousCourses).to.equal(autonomousCourses);
  });
});
