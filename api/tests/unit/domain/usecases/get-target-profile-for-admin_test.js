import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-target-profile-for-admin', function () {
  it('should get target profile for admin', async function () {
    // given
    const targetProfileAdminRepository = {
      get: sinon.stub(),
    };
    const targetProfile = Symbol('targetProfile');
    targetProfileAdminRepository.get.withArgs({ id: 123 }).resolves(targetProfile);

    // when
    const result = await usecases.getTargetProfileForAdmin({
      targetProfileId: 123,
      targetProfileAdminRepository,
    });

    // then
    expect(result).to.deep.equal(targetProfile);
  });
});
