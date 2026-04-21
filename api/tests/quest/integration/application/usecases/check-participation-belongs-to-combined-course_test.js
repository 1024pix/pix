import * as checkParticipationBelongsToCombinedCourse from '../../../../../src/quest/application/usecases/check-participation-belongs-to-combined-course.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Application | Usecases | checkParticipationBelongsToCombinedCourse', function () {
  it('should return true when participation is in combined course', async function () {
    // given
    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
    const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
      combinedCourseId,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
    });
    await databaseBuilder.commit();

    // when
    const authorized = await checkParticipationBelongsToCombinedCourse.execute({ combinedCourseId, participationId });

    // then
    expect(authorized).true;
  });

  it('should return false when participation is not in combined course', async function () {
    // given
    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
    const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
    });
    await databaseBuilder.commit();

    // when
    const authorized = await checkParticipationBelongsToCombinedCourse.execute({ combinedCourseId, participationId });

    // then
    expect(authorized).false;
  });
});
