import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Application | Usecases | isParticipationOnCombinedCourse', function () {
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
    const authorized = await usecases.isParticipationOnCombinedCourse({ combinedCourseId, participationId });

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
    const authorized = await usecases.isParticipationOnCombinedCourse({ combinedCourseId, participationId });

    // then
    expect(authorized).false;
  });
});
