import { expect } from 'chai';

import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | detach-organizations-from-combined-course-blueprint', function () {
  it('should detach specified organizations from a combined course blueprint', async function () {
    // given
    const combinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    const combinedCourseBlueprintShare2 = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
      combinedCourseBlueprintId: combinedCourseBlueprintShare.combinedCourseBlueprintId,
    });
    const combinedCourseBlueprintShare3 = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
      combinedCourseBlueprintId: combinedCourseBlueprintShare.combinedCourseBlueprintId,
    });

    await databaseBuilder.commit();

    // when
    await usecases.detachOrganizationsFromCombinedCourseBlueprint({
      combinedCourseBlueprintId: combinedCourseBlueprintShare.combinedCourseBlueprintId,
      organizationIds: [combinedCourseBlueprintShare2.organizationId, combinedCourseBlueprintShare3.organizationId],
    });

    // then
    const result = await usecases.getCombinedCourseBlueprintById({
      id: combinedCourseBlueprintShare.combinedCourseBlueprintId,
    });

    expect(result.organizationIds).deep.equal([combinedCourseBlueprintShare.organizationId]);
  });

  it('should throw if combined course blueprint is not found', async function () {
    // when
    const error = await catchErr(usecases.detachOrganizationsFromCombinedCourseBlueprint)({
      combinedCourseBlueprintId: 123,
      organizationIds: [445, 554],
    });

    // then
    expect(error).instanceOf(NotFoundError);
  });
});
