import { expect } from 'chai';

import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | get-combined-courses-by-organization-id', function () {
  it('should return array of combined course ids for an organization', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE1',
      name: 'First Combined Course',
      organizationId,
    });
    const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE2',
      name: 'Second Combined Course',
      organizationId,
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.findCombinedCourseIdsByOrganizationId({ organizationId });

    // then
    expect(result).to.have.lengthOf(2);
    expect(result).to.deep.equal([combinedCourseId1, combinedCourseId2]);
  });

  it('should return empty array when no combined courses exist for organization', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    // when
    const result = await usecases.findCombinedCourseIdsByOrganizationId({ organizationId });

    // then
    expect(result).to.deep.equal([]);
  });
});
