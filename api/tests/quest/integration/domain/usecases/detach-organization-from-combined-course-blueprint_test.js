import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | detach-organization-from-combined-course-blueprint', function () {
  it('should detach an organization from a combined course blueprint', async function () {
    // given
    const combinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    const combinedCourseBlueprintShare2 = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
      combinedCourseBlueprintId: combinedCourseBlueprintShare.combinedCourseBlueprintId,
    });

    await databaseBuilder.commit();

    // when
    await usecases.detachOrganizationFromCombinedCourseBlueprint({
      combinedCourseBlueprintId: combinedCourseBlueprintShare.combinedCourseBlueprintId,
      organizationId: combinedCourseBlueprintShare.organizationId,
    });

    // then
    const result = await usecases.getCombinedCourseBlueprintById({
      id: combinedCourseBlueprintShare.combinedCourseBlueprintId,
    });

    expect(result.organizationIds).deep.equal([combinedCourseBlueprintShare2.organizationId]);
  });

  it('should throw if combined course blueprint is not found', async function () {
    // when
    const error = await catchErr(usecases.detachOrganizationFromCombinedCourseBlueprint)({
      combinedCourseBlueprintId: 123,
      organizationId: 445,
    });

    // then
    expect(error).instanceOf(NotFoundError);
  });
});
