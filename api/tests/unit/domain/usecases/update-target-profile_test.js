const { expect, sinon } = require('../../../test-helper');
const { updateTargetProfile } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-target-profile', function () {
  it('should call repository method to update a target profile', async function () {
    //given
    const targetProfileRepository = {
      update: sinon.stub(),
    };

    //when
    await updateTargetProfile({
      id: 123,
      name: 'Tom',
      description: 'description changée',
      comment: 'commentaire changé',
      targetProfileRepository,
    });

    //then
    expect(targetProfileRepository.update).to.have.been.calledOnceWithExactly({
      id: 123,
      name: 'Tom',
      description: 'description changée',
      comment: 'commentaire changé',
    });
  });
});
