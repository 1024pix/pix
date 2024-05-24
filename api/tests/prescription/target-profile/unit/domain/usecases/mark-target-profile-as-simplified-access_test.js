import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const { markTargetProfileAsSimplifiedAccess } = usecases;

describe('Unit | Target Profile | Domain | UseCase | mark-target-profile-as-simplified-access', function () {
  it('should call repository method to update "isSimplifiedAccess" in target profile', async function () {
    //given
    const targetProfileAdministrationRepository = {
      update: sinon.stub(),
    };
    const targetProfile = domainBuilder.buildTargetProfile({ id: 12345, isSimplifiedAccess: false });
    targetProfileAdministrationRepository.update.resolves({ id: targetProfile.id, isSimplifiedAccess: true });

    //when
    const result = await markTargetProfileAsSimplifiedAccess({
      id: targetProfile.id,
      targetProfileAdministrationRepository,
    });

    //then
    expect(targetProfileAdministrationRepository.update).to.have.been.calledOnceWithExactly({
      id: 12345,
      isSimplifiedAccess: true,
    });
    expect(result).to.deep.equal({ id: targetProfile.id, isSimplifiedAccess: true });
  });
});
