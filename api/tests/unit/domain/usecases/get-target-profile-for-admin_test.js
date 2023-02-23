const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | get-target-profile-for-admin', function () {
  it('should get target profile for admin', async function () {
    // given
    const targetProfileForAdminRepository = {
      get: sinon.stub(),
    };
    const targetProfile = Symbol('targetProfile');
    targetProfileForAdminRepository.get.withArgs({ id: 123 }).resolves(targetProfile);

    // when
    const result = await usecases.getTargetProfileForAdmin({
      targetProfileId: 123,
      targetProfileForAdminRepository,
    });

    // then
    expect(result).to.deep.equal(targetProfile);
  });
});
