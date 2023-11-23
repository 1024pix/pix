import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { getLearningContentByTargetProfile } from '../../../../../../src/prescription/target-profile/domain/usecases/get-learning-content-by-target-profile.js';

describe('Unit | UseCase | get-learning-content-by-target-profile', function () {
  const learningContentRepository = {};
  const targetProfileForAdminRepository = {};

  beforeEach(function () {
    learningContentRepository.findByTargetProfileId = sinon.stub();
    targetProfileForAdminRepository.get = sinon.stub();
  });

  it('should return the result of repository call', async function () {
    // given
    const learningContent = domainBuilder.buildLearningContent();
    const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ name: 'titre profil cible' });
    learningContentRepository.findByTargetProfileId.withArgs(123, 'fr').resolves(learningContent);
    targetProfileForAdminRepository.get.withArgs({ id: 123 }).resolves(targetProfileForAdmin);
    // when
    const actualLearningContent = await getLearningContentByTargetProfile({
      targetProfileId: 123,
      language: 'fr',
      learningContentRepository,
      targetProfileForAdminRepository,
    });

    // then
    expect(actualLearningContent).to.deep.equal({
      learningContent,
      targetProfileName: targetProfileForAdmin.name,
    });
  });
});
