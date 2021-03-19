const { expect, sinon } = require('../../../test-helper');
const { updateTargetProfileName } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-target-profile-name', () => {

  it('should call repository method to update a target profile name', async () => {
    //given
    const targetProfileRepository = {
      update: sinon.stub(),
    };

    //when
    await updateTargetProfileName({ id: 123, name: 'Tom', targetProfileRepository });

    //then
    expect(targetProfileRepository.update).to.have.been.calledOnceWithExactly({ id: 123, name: 'Tom' });

  });

});
