import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseDetails } from '../../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Integration | Domain | Usecases | getCombinedCourseById', function () {
  it('should return a CombinedCourseDetails instance with quest and combined course data', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;

    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: 100 }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: 200 }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: 300 }).toDTO(),
      ],
    });
    const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({
      name: 'Test Combined Course',
      description: 'A test combined course description',
      illustration: 'https://example.com/image.png',
      code: 'TEST_COURSE_123',
      organizationId,
      questId,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCourseById({
      combinedCourseId,
    });

    // then
    expect(result).to.be.instanceOf(CombinedCourseDetails);
    expect(result.id).to.equal(combinedCourseId);
    expect(result.name).to.equal('Test Combined Course');
    expect(result.description).to.equal('A test combined course description');
    expect(result.illustration).to.equal('https://example.com/image.png');
    expect(result.code).to.equal('TEST_COURSE_123');
    expect(result.organizationId).to.equal(organizationId);
    expect(result.campaignIds).to.deep.equal([100, 200, 300]);
  });

  it('should throw if quest is not combined course', async function () {
    // when
    const error = await catchErr(usecases.getCombinedCourseById)({
      combinedCourseId: 12,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
