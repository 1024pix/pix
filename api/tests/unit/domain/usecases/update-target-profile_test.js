const { expect, sinon } = require('../../../test-helper');
const { updateTargetProfile } = require('../../../../lib/domain/usecases/index.js');
const TargetProfileForUpdate = require('../../../../lib/domain/models/TargetProfileForUpdate');

describe('Unit | UseCase | update-target-profile', function () {
  it('should call repository method to update a target profile', async function () {
    //given
    const targetProfileForUpdateRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };

    const targetProfileToUpdate = new TargetProfileForUpdate({
      id: 123,
      name: 'name',
      description: 'description',
      comment: 'comment',
    });

    const expectedTargetProfile = new TargetProfileForUpdate({
      id: 123,
      name: 'Tom',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
    });

    await targetProfileForUpdateRepository.get.withArgs(123).resolves(targetProfileToUpdate);

    //when
    await updateTargetProfile({
      id: 123,
      name: 'Tom',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    //then
    expect(targetProfileForUpdateRepository.update).to.have.been.calledOnceWithExactly(expectedTargetProfile);
  });
});
