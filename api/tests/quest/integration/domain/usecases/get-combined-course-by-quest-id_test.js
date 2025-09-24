import { CombinedCourseDetails } from '../../../../../src/quest/domain/models/CombinedCourse.js';
import getCombinedCourseByQuestId from '../../../../../src/quest/domain/usecases/get-combined-course-by-quest-id.js';
import * as combinedCourseRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-repository.js';
import * as questRepository from '../../../../../src/quest/infrastructure/repositories/quest-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Quest | Integration | Domain | Usecases | getCombinedCourseByQuestId', function () {
  it('should return a CombinedCourseDetails instance with quest and combined course data', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;

    const questId = databaseBuilder.factory.buildQuest({
      name: 'Test Combined Course',
      description: 'A test combined course description',
      illustration: 'https://example.com/image.png',
      code: 'TEST_COURSE_123',
      organizationId,
      eligibilityRequirements: [],
      successRequirements: [
        {
          data: { status: { data: 'SHARED', comparison: 'equal' }, campaignId: { data: 100, comparison: 'equal' } },
          comparison: 'all',
          requirement_type: 'campaignParticipations',
        },
        {
          data: { status: { data: 'SHARED', comparison: 'equal' }, campaignId: { data: 200, comparison: 'equal' } },
          comparison: 'all',
          requirement_type: 'campaignParticipations',
        },
        {
          data: { status: { data: 'SHARED', comparison: 'equal' }, campaignId: { data: 300, comparison: 'equal' } },
          comparison: 'all',
          requirement_type: 'campaignParticipations',
        },
      ],
      rewardType: 'attestations',
      rewardId: null,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await getCombinedCourseByQuestId({
      questId,
      questRepository,
      combinedCourseRepository,
    });

    // then
    expect(result).to.be.instanceOf(CombinedCourseDetails);
    expect(result.id).to.equal(questId);
    expect(result.name).to.equal('Test Combined Course');
    expect(result.description).to.equal('A test combined course description');
    expect(result.illustration).to.equal('https://example.com/image.png');
    expect(result.code).to.equal('TEST_COURSE_123');
    expect(result.organizationId).to.equal(organizationId);
    expect(result.campaignIds).to.deep.equal([100, 200, 300]);
  });

  it('should throw if quest is not combined course', async function () {
    // given
    const questId = databaseBuilder.factory.buildQuest({
      name: 'Test Combined Course',
      description: 'A test combined course description',
      illustration: 'https://example.com/image.png',
      code: null,
      organizationId: null,
      eligibilityRequirements: [],
      successRequirements: [],
      rewardType: null,
      rewardId: null,
    }).id;

    await databaseBuilder.commit();

    // when
    const error = await catchErr(getCombinedCourseByQuestId)({
      questId,
      questRepository,
      combinedCourseRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
