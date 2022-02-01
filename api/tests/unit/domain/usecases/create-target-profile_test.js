const { expect, sinon } = require('../../../test-helper');
const TargetProfileForCreation = require('../../../../lib/domain/models/TargetProfileForCreation');
const createTargetProfile = require('../../../../lib/domain/usecases/create-target-profile');

describe('Unit | UseCase | create-target-profile', function () {
  let targetProfileRepositoryStub;
  let targetProfileWithLearningContentRepositoryStub;

  beforeEach(function () {
    targetProfileRepositoryStub = {
      create: sinon.stub(),
    };

    targetProfileWithLearningContentRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should create target profile with skills given data', async function () {
    //given
    const skillIds = ['skill1-tube1', 'skill3-tube1'];
    const targetProfileWithLearningContent = Symbol('ok');
    const targetProfileData = {
      isPublic: true,
      name: 'name',
      skillIds,
    };
    const targetProfileId = 12;
    const targetProfile = new TargetProfileForCreation(targetProfileData);

    targetProfileRepositoryStub.create.withArgs(targetProfile).resolves(targetProfileId);
    targetProfileWithLearningContentRepositoryStub.get
      .withArgs({ id: targetProfileId })
      .resolves(targetProfileWithLearningContent);

    //when
    const result = await createTargetProfile({
      targetProfileData,
      targetProfileRepository: targetProfileRepositoryStub,
      targetProfileWithLearningContentRepository: targetProfileWithLearningContentRepositoryStub,
    });

    //then
    expect(result).to.equal(targetProfileWithLearningContent);
  });
});
