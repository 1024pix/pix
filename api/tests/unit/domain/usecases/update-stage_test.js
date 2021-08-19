const { expect, sinon } = require('../../../test-helper');
const { updateStage } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-stage', function() {

  it('should call repository method to update prescriberTitle and prescriberDescription for a stage', async function() {
    //given
    const stageRepository = {
      updateStagePrescriberAttributes: sinon.stub(),
    };

    //when
    await updateStage({ stageId: 44, prescriberTitle: 'palier bof', prescriberDescription: 'tu es moyen', stageRepository });

    //then
    expect(stageRepository.updateStagePrescriberAttributes).to.have.been.calledOnceWithExactly({ id: 44, prescriberTitle: 'palier bof', prescriberDescription: 'tu es moyen' });
  });
});
