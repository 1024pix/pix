const { expect, sinon } = require('../../../test-helper');
const TargetProfileForCreation = require('../../../../lib/domain/models/TargetProfileForCreation');
const createTemplateTargetProfile = require('../../../../lib/domain/usecases/create-template-target-profile-and-target-profile');

describe('Unit | UseCase | create-target-profile', function () {
  let targetProfileRepositoryStub;
  let targetProfileWithLearningContentRepositoryStub;

  beforeEach(function () {
    targetProfileRepositoryStub = {
      createTemplateAndTargetProfile: sinon.stub(),
    };

    targetProfileWithLearningContentRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should create template target profile and target profile with skills given data', async function () {
    //given
    const skillIds = ['skill1-tube1', 'skill3-tube1'];
    const targetProfileTemplateData = {
      tubes: [
        {
          id: 'tube1',
          level: 5,
        },
        {
          id: 'tube2',
          level: 3,
        },
      ],
    };

    const targetProfileWithLearningContent = Symbol('ok');
    const targetProfileData = {
      isPublic: true,
      name: 'name',
      skillIds,
    };
    const targetProfileId = 'targetProfile_1';
    const targetProfileTemplateId = 'targetProfileTemplate_1';
    const targetTemplateProfileStubResult = {
      id: targetProfileTemplateId,
      targetProfileIds: [targetProfileId],
    };
    const targetProfileForCreation = new TargetProfileForCreation(targetProfileData);

    targetProfileRepositoryStub.createTemplateAndTargetProfile
      .withArgs({ targetProfileForCreation, targetProfileTemplate: targetProfileTemplateData })
      .resolves(targetTemplateProfileStubResult);

    targetProfileWithLearningContentRepositoryStub.get
      .withArgs({ id: targetProfileId })
      .resolves(targetProfileWithLearningContent);

    //when
    const result = await createTemplateTargetProfile({
      targetProfileTemplateData,
      targetProfileData,
      targetProfileRepository: targetProfileRepositoryStub,
      targetProfileWithLearningContentRepository: targetProfileWithLearningContentRepositoryStub,
    });

    //then
    expect(result).to.deep.contain({
      id: targetProfileTemplateId,
      targetProfiles: [targetProfileWithLearningContent],
    });
  });
});
