import { findPaginatedMissionLearners } from '../../../../../src/school/domain/usecases/find-paginated-mission-learners.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | find-paginated-mission-learners', function () {
  let missionLearnerRepository,
    missionAssessmentRepository,
    activityRepository,
    organizationId,
    missionId,
    page,
    learner,
    pagination,
    filter;

  beforeEach(function () {
    missionLearnerRepository = { findPaginatedMissionLearners: sinon.stub() };
    missionAssessmentRepository = { getStatusesForLearners: sinon.stub() };
    activityRepository = { getAllByAssessmentId: sinon.stub() };
    organizationId = 1234567;
    missionId = 3;
    page = { size: 4, number: 2 };
    learner = {
      id: 34,
    };
    pagination = { page: 2, pageCount: 1, pageSize: 4, rowCount: 8 };
    filter = { divisions: ['CP'] };
  });

  it('should call missionLearnerRepository with good args', async function () {
    missionLearnerRepository.findPaginatedMissionLearners.resolves({ pagination, missionLearners: [learner] });
    missionAssessmentRepository.getStatusesForLearners
      .withArgs(missionId, [learner], function () {
        return;
      })
      .resolves([learner]);

    await findPaginatedMissionLearners({
      organizationId,
      page,
      missionId,
      missionLearnerRepository,
      missionAssessmentRepository,
      activityRepository,
      filter,
    });

    expect(missionLearnerRepository.findPaginatedMissionLearners).to.have.been.calledWithExactly({
      organizationId,
      page,
      filter,
    });
  });
});
