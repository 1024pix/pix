const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-target-profile-details', () => {

  it('should get target profile details', async () => {
    // given
    const expectedResult = Symbol('target profile');
    const targetProfileId = Symbol('target profile id');

    const targetProfileRepository = {
      get: sinon.stub(),
    };
    targetProfileRepository.get.withArgs(targetProfileId).resolves(expectedResult);

    // when
    const response = await usecases.getTargetProfileDetails({ targetProfileId, targetProfileRepository });

    // then
    expect(response).to.equal(expectedResult);
  });
});
