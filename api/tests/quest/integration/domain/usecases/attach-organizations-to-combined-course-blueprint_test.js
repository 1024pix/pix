import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | attach-organizations-to-combined-course-blueprint', function () {
  it('should return duplicated ids and attached ids for a given combined course blueprint', async function () {
    // given
    const organizationToAttach = databaseBuilder.factory.buildOrganization();
    const existingCombinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare();

    await databaseBuilder.commit();

    // when
    const result = await usecases.attachOrganizationsToCombinedCourseBlueprint({
      combinedCourseBlueprintId: existingCombinedCourseBlueprintShare.combinedCourseBlueprintId,
      organizationIds: [existingCombinedCourseBlueprintShare.organizationId, organizationToAttach.id],
    });

    expect(result).to.deep.equal({
      duplicatedIds: [existingCombinedCourseBlueprintShare.organizationId],
      attachedIds: [organizationToAttach.id],
    });
  });

  it('should throw if combined course blueprint is not found', async function () {
    // when
    const error = await catchErr(usecases.attachOrganizationsToCombinedCourseBlueprint)({
      combinedCourseBlueprintId: 123,
      organizationId: 445,
    });

    // then
    expect(error).instanceOf(NotFoundError);
  });
});
