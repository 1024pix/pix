import { usecases } from '../../../../../src/quest/domain/usecases/index.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | update-combined-courses', function () {
  const lastUpdatedAt = new Date('2025-07-07');

  it('should update names and updatedAt of combined courses with corresponding ids', async function () {
    //given
    const firstCombinedCourse = await databaseBuilder.factory.buildCombinedCourse({
      code: 'FIRST',
      updatedAt: lastUpdatedAt,
    });
    const secondCombinedCourse = await databaseBuilder.factory.buildCombinedCourse({
      code: 'SECOND',
      updatedAt: lastUpdatedAt,
    });

    const otherCombinedCourse = await databaseBuilder.factory.buildCombinedCourse({
      updatedAt: lastUpdatedAt,
    });

    await databaseBuilder.commit();

    //then
    await usecases.updateCombinedCourses({
      combinedCourseIds: [firstCombinedCourse.id, secondCombinedCourse.id],
      name: 'new-name',
    });

    const updatedCombinedCourses = await knex('combined_courses').whereIn('id', [
      firstCombinedCourse.id,
      secondCombinedCourse.id,
    ]);

    const notUpdatedCombinedCourse = await knex('combined_courses').where('id', otherCombinedCourse.id).first();

    expect(updatedCombinedCourses[0].name).to.equal('new-name');
    expect(updatedCombinedCourses[0].updatedAt).to.be.above(lastUpdatedAt);

    expect(updatedCombinedCourses[1].name).to.equal('new-name');
    expect(updatedCombinedCourses[1].updatedAt).to.be.above(lastUpdatedAt);

    expect(notUpdatedCombinedCourse.name).to.equal(otherCombinedCourse.name);
    expect(notUpdatedCombinedCourse.updatedAt).not.to.be.above(lastUpdatedAt);
  });
});
