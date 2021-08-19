const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-target-profile-details', function() {

  it('should get target profile details', async function() {
    // given
    const expectedResult = Symbol('target profile');
    const targetProfileId = Symbol('target profile id');

    const targetProfileWithLearningContentRepository = {
      get: sinon.stub(),
    };
    targetProfileWithLearningContentRepository.get.withArgs({ id: targetProfileId }).resolves(expectedResult);

    // when
    const response = await usecases.getTargetProfileDetails({ targetProfileId, targetProfileWithLearningContentRepository });

    // then
    expect(response).to.equal(expectedResult);
  });
});
