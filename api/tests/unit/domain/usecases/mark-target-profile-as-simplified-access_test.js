const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { markTargetProfileAsSimplifiedAccess } = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | mark-target-profile-as-simplified-access', function () {
  it('should call repository method to update "isSimplifiedAccess" in target profile', async function () {
    //given
    const targetProfileRepository = {
      update: sinon.stub(),
    };
    const targetProfile = domainBuilder.buildTargetProfile({ id: 12345, isSimplifiedAccess: false });
    targetProfileRepository.update.resolves({ id: targetProfile.id, isSimplifiedAccess: true });

    //when
    const result = await markTargetProfileAsSimplifiedAccess({
      id: targetProfile.id,
      targetProfileRepository,
    });

    //then
    expect(targetProfileRepository.update).to.have.been.calledOnceWithExactly({
      id: 12345,
      isSimplifiedAccess: true,
    });
    expect(result).to.deep.equal({ id: targetProfile.id, isSimplifiedAccess: true });
  });
});
