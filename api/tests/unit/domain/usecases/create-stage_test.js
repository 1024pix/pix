const { expect, sinon } = require('../../../test-helper');
const createStage = require('../../../../lib/domain/usecases/create-stage');

describe('Unit | UseCase | create-stage', function () {
  it('should call the stage repository', async function () {
    // given
    const stageCreated = {};
    const stageRepository = { create: sinon.stub().returns(stageCreated) };
    const stage = { title: 'My stage' };

    // when
    const result = await createStage({ stage, stageRepository });

    // then
    expect(stageRepository.create.calledWith(stage)).to.be.true;
    expect(result).to.equal(stageCreated);
  });
});
