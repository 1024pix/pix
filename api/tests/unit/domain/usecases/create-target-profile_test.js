const { TargetProfileInvalidError } = require('../../../../lib/domain/errors');

const { expect, catchErr, sinon } = require('../../../test-helper');
const createTargetProfile = require('../../../../lib/domain/usecases/create-target-profile');

describe('Unit | UseCase | create-target-profile', function() {
  let targetProfileRepositoryStub;
  let targetProfileWithLearningContentRepositoryStub;

  const targetProfileId = 'targetProfileId';
  const organizationId = null;
  const name = 'MyTargetProfile';
  const isPublic = false;
  const imageUrl = 'myurlsample';

  beforeEach(function() {
    targetProfileRepositoryStub = {
      create: sinon.stub(),
    };

    targetProfileWithLearningContentRepositoryStub = {
      get: sinon.stub(),
    };

  });

  describe('when targetProfile is valid', function() {

    it('should create target profile with skills given data', async function() {
      //given
      const skillsId = ['skill1-tube1', 'skill3-tube1'];
      const targetProfile = Symbol('ok');
      const targetProfileData = {
        isPublic,
        name,
        imageUrl,
        organizationId,
        skillsId,
      };

      targetProfileRepositoryStub.create.withArgs(targetProfileData).resolves(targetProfileId);
      targetProfileWithLearningContentRepositoryStub.get.withArgs({ id: targetProfileId }).resolves(targetProfile);

      //when
      const result = await createTargetProfile({ targetProfileData, targetProfileRepository: targetProfileRepositoryStub, targetProfileWithLearningContentRepository: targetProfileWithLearningContentRepositoryStub });

      //then
      expect(result).to.equal(targetProfile);
    });

    it('should create target profile with default imageUrl if none is specified', async function() {
      //given
      const skillsId = ['skill1-tube1', 'skill3-tube1'];
      const targetProfile = Symbol('ok');
      const targetProfileData = {
        isPublic,
        name,
        imageUrl: null,
        organizationId,
        skillsId,
      };
      targetProfileRepositoryStub.create.resolves(targetProfileId);
      targetProfileWithLearningContentRepositoryStub.get.withArgs({ id: targetProfileId }).resolves(targetProfile);

      //when
      await createTargetProfile({ targetProfileData, targetProfileRepository: targetProfileRepositoryStub, targetProfileWithLearningContentRepository: targetProfileWithLearningContentRepositoryStub });

      //then
      expect(targetProfileRepositoryStub.create).to.have.been.calledWith({
        isPublic,
        name,
        imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
        organizationId,
        skillsId,
      });
    });
  });

  it('should return TargetProfileInvalidError given empty skills', async function() {
    const skillsId = [];
    //given
    const targetProfileData = {
      isPublic,
      name,
      imageUrl,
      organizationId,
      skillsId,
    };

    const result = await catchErr(createTargetProfile)({ targetProfileData, targetProfileRepository: targetProfileRepositoryStub, targetProfileWithLearningContentRepository: targetProfileWithLearningContentRepositoryStub });

    expect(result).to.be.instanceOf(TargetProfileInvalidError);
  });
});
