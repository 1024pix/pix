import { AnswerStatus, Examiner, ValidatorAlwaysOK } from '../../../../../lib/domain/models/index.js';
import { correctPreviewAnswer } from '../../../../../src/school/domain/usecases/correct-preview-answer.js';
import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import { domainBuilder, expect, knex, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCases | correct-preview-answer', function () {
  it('returns corrected answers', async function () {
    // given
    const challenge = learningContentBuilder.buildChallenge();
    const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });
    const activityAnswer = domainBuilder.buildActivityAnswer({
      id: null,
      challengeId: challenge.id,
    });

    const learningContent = {
      challenges: [challenge],
      skills: [skill],
    };

    mockLearningContent(learningContent);

    const alwaysTrueExaminer = new Examiner({ validator: new ValidatorAlwaysOK() });

    // when
    const correctedAnswer = await correctPreviewAnswer({
      activityAnswer,
      challengeRepository,
      examiner: alwaysTrueExaminer,
    });

    const activityAnswersCount = await knex('activity-answers').count('id').first();

    // then
    expect(activityAnswersCount.count).to.equal(0);
    expect(correctedAnswer.id).to.equal('preview-id');
    expect(correctedAnswer.result).to.deep.equal(AnswerStatus.OK);
  });
});
