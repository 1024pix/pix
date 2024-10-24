import { getLearningContentByTargetProfile } from '../../../../../../src/prescription/target-profile/domain/usecases/get-learning-content-by-target-profile.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-learning-content-by-target-profile', function () {
  const learningContentRepository = {};
  const targetProfileAdministrationRepository = {};

  beforeEach(function () {
    learningContentRepository.findByTargetProfileId = sinon.stub();
    targetProfileAdministrationRepository.get = sinon.stub();
  });

  it('should return the result of repository call', async function () {
    // given
    const learningContent = domainBuilder.buildLearningContent();
    const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ name: 'titre profil cible' });
    learningContentRepository.findByTargetProfileId.withArgs(123, 'fr').resolves(learningContent);
    targetProfileAdministrationRepository.get.withArgs({ id: 123 }).resolves(targetProfileForAdmin);
    // when
    const actualLearningContent = await getLearningContentByTargetProfile({
      targetProfileId: 123,
      language: 'fr',
      learningContentRepository,
      targetProfileAdministrationRepository,
    });

    // then
    expect(actualLearningContent).to.deep.equal({
      learningContent,
      targetProfileName: targetProfileForAdmin.name,
    });
  });
});
