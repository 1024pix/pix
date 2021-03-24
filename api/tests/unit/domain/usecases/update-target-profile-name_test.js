const { expect, sinon } = require('../../../test-helper');
const { updateTargetProfileName } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-target-profile-name', function() {

  it('should call repository method to update a target profile name', async function() {
    //given
    const targetProfileRepository = {
      updateName: sinon.stub(),
    };

    //when
    await updateTargetProfileName({ id: 123, name: 'Tom', targetProfileRepository });

    //then
    expect(targetProfileRepository.updateName).to.have.been.calledOnceWithExactly({ id: 123, name: 'Tom' });

  });

});
