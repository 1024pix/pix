import { expect, sinon, domainBuilder } from '../../../test-helper';
import getLearningContentByTargetProfile from '../../../../lib/domain/usecases/get-learning-content-by-target-profile';

describe('Unit | UseCase | get-learning-content-by-target-profile', function () {
  const learningContentRepository = {};

  beforeEach(function () {
    learningContentRepository.findByTargetProfileId = sinon.stub();
  });

  it('should return the result of repository call', async function () {
    // given
    const learningContent = domainBuilder.buildLearningContent();
    learningContentRepository.findByTargetProfileId.withArgs(123, 'fr').resolves(learningContent);

    // when
    const actualLearningContent = await getLearningContentByTargetProfile({
      targetProfileId: 123,
      language: 'fr',
      learningContentRepository,
    });

    // then
    expect(actualLearningContent).to.deep.equal(learningContent);
  });
});
