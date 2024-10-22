import { getTargetProfileForAdmin } from '../../../../../../src/prescription/target-profile/domain/usecases/get-target-profile-for-admin.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-target-profile-for-admin', function () {
  it('should get target profile for admin', async function () {
    // given
    const targetProfileAdministrationRepository = {
      get: sinon.stub(),
    };
    const targetProfile = Symbol('targetProfile');
    targetProfileAdministrationRepository.get.withArgs({ id: 123 }).resolves(targetProfile);

    // when
    const result = await getTargetProfileForAdmin({
      targetProfileId: 123,
      targetProfileAdministrationRepository,
    });

    // then
    expect(result).to.deep.equal(targetProfile);
  });
});
