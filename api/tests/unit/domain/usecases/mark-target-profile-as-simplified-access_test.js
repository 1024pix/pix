const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { markTargetProfileAsSimplifiedAccess } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | mark-target-profile-as-simplified-access', function () {
  it('should call repository method to update "isSimplifiedAccess" in target profile', async function () {
    //given
    const targetProfileRepository = {
      update: sinon.stub(),
    };
    const targetProfile = domainBuilder.buildTargetProfile({ id: 12345, isSimplifiedAccess: false });

    //when
    await markTargetProfileAsSimplifiedAccess({
      id: targetProfile.id,
      targetProfileRepository,
    });

    //then
    expect(targetProfileRepository.update).to.have.been.calledOnceWithExactly({
      id: 12345,
      isSimplifiedAccess: true,
    });
  });
});
