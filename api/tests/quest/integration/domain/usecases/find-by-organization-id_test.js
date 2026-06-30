import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | find-by-organization-id', function () {
  it('should return combined course blueprints array if at least a result is found', async function () {
    //given
    const { organizationId } = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
    await databaseBuilder.commit();

    //when
    const results = await usecases.findByOrganizationId({ organizationId });

    //then
    expect(results).lengthOf(1);
    expect(results[0]).to.be.instanceOf(CombinedCourseBlueprint);
  });
});
