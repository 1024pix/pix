import { expect } from 'chai';

import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | is-combined-course-blueprint-in-organization', function () {
  it('should return true if the combined course blueprint belongs to the organization', async function () {
    // given
    //given
    databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    const { combinedCourseBlueprintId, organizationId } = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    databaseBuilder.factory.buildCombinedCourseBlueprintShare();

    await databaseBuilder.commit();

    // when
    const result = await usecases.isCombinedCourseBlueprintInOrganization({
      combinedCourseBlueprintId,
      organizationId,
    });

    //then
    expect(result).to.be.true;
  });

  it('should return false otherwise', async function () {
    // given
    //given
    databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    databaseBuilder.factory.buildCombinedCourseBlueprintShare();

    await databaseBuilder.commit();

    // when
    const result = await usecases.isCombinedCourseBlueprintInOrganization({
      combinedCourseBlueprintId: 999,
      organizationId: 999,
    });

    //then
    expect(result).to.be.false;
  });
});
