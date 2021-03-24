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

  it('should create target profile with skills given data', async function() {
    const skillsId = ['skill1-tube1', 'skill3-tube1'];
    const targetProfile = Symbol('ok');
    //given
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

    expect(result).to.equal(targetProfile);
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
