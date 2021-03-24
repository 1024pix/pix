const { expect, sinon } = require('../../../test-helper');
const { getStageDetails } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-stage-details', function() {

  it('should call repository method to get all details of a stage', async function() {
    //given
    const stageRepository = {
      get: sinon.stub(),
    };
    const id = 44;
    //when
    await getStageDetails({ stageId: 44, stageRepository });

    //then
    expect(stageRepository.get).to.have.been.calledOnceWithExactly(id);
  });
});
