import { CombinedCourseDetails } from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseDetails.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Integration | Domain | Usecases | getCombinedCourseParticipationById', function () {
  it('should return participation details with given id', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
    const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({ organizationId }).id;
    const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
      organizationLearnerId,
      combinedCourseId,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCourseParticipationById({ participationId, combinedCourseId });

    // then
    expect(result).instanceOf(CombinedCourseDetails);
    expect(result.id).equal(combinedCourseId);
    expect(result.participation.id).equal(participationId);
  });

  it('should throw when no participation found', async function () {
    // given
    const combinedCourseId = databaseBuilder.factory.buildCombinedCourse().id;
    const participationId = 12;

    // when
    const error = await catchErr(usecases.getCombinedCourseParticipationById)({ participationId, combinedCourseId });

    // then
    expect(error).to.be.instanceof(NotFoundError);
    expect(error.message).to.equal(
      `CombinedCourseParticipation introuvable à l'id ${participationId} pour le combined course ${combinedCourseId}`,
    );
  });
});
