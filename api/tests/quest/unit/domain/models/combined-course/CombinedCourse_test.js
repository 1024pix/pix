import { CombinedCourseParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourse } from '../../../../../../src/quest/domain/models/combined-course/CombinedCourse.js';
import { CombinedCourseParticipation } from '../../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseParticipation.js';
import { expect } from '../../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourse', function () {
  it('should return model with given parameters', function () {
    // given
    const id = 1;
    const organizationId = 1;
    const name = 'name';
    const code = 'code';

    // when
    const combinedCourseDetails = new CombinedCourse({ id, organizationId, name, code, questId: 2 });

    // then
    expect(combinedCourseDetails.code).to.deep.equal(code);
    expect(combinedCourseDetails.name).to.deep.equal(name);
    expect(combinedCourseDetails.organizationId).to.deep.equal(organizationId);
    expect(combinedCourseDetails.id).to.deep.equal(id);
    expect(combinedCourseDetails.questId).to.deep.equal(2);
  });

  it('should throw when combined course model does not pass validation', function () {
    // given
    const id = 1;
    const organizationId = 1;
    const name = 'name';
    const code = 123;

    // when
    expect(() => {
      new CombinedCourse({ id, organizationId, name, code });
    }).to.throw();
  });

  describe('#participationsCount', function () {
    it('should return 0 when there are no participations', function () {
      // given
      const combinedCourseDetails = new CombinedCourse({ id: 1, organizationId: 1, name: 'name', code: 'code' });

      // when
      const count = combinedCourseDetails.participationsCount;

      // then
      expect(count).to.equal(0);
    });

    it('should return the number of participations', function () {
      // given
      const combinedCourseDetails = new CombinedCourse({ id: 1, organizationId: 1, name: 'name', code: 'code' });
      combinedCourseDetails.participations = [
        new CombinedCourseParticipation({
          id: 1,
          questId: 1,
          organizationLearnerId: 1,
          status: CombinedCourseParticipationStatuses.STARTED,
        }),
        new CombinedCourseParticipation({
          id: 2,
          questId: 1,
          organizationLearnerId: 2,
          status: CombinedCourseParticipationStatuses.STARTED,
        }),
        new CombinedCourseParticipation({
          id: 3,
          questId: 1,
          organizationLearnerId: 3,
          status: CombinedCourseParticipationStatuses.STARTED,
        }),
      ];

      // when
      const count = combinedCourseDetails.participationsCount;

      // then
      expect(count).to.equal(3);
    });
  });

  describe('#completedParticipationsCount', function () {
    it('should return the number of completed participations', function () {
      // given
      const combinedCourseDetails = new CombinedCourse({ id: 1, organizationId: 1, name: 'name', code: 'code' });
      combinedCourseDetails.participations = [
        new CombinedCourseParticipation({
          id: 1,
          questId: 1,
          organizationLearnerId: 1,
          status: CombinedCourseParticipationStatuses.COMPLETED,
        }),
        new CombinedCourseParticipation({
          id: 2,
          questId: 1,
          organizationLearnerId: 2,
          status: CombinedCourseParticipationStatuses.STARTED,
        }),
        new CombinedCourseParticipation({
          id: 3,
          questId: 1,
          organizationLearnerId: 3,
          status: CombinedCourseParticipationStatuses.COMPLETED,
        }),
      ];

      // when
      const count = combinedCourseDetails.completedParticipationsCount;

      // then
      expect(count).to.equal(2);
    });
  });
});
