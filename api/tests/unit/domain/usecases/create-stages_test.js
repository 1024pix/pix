const { expect, sinon, domainBuilder } = require('../../../test-helper');
const createStage = require('../../../../lib/domain/usecases/create-stages');

describe('Unit | UseCase | create-stage', function () {
  it('should call repository method with appropriate stage to create', async function () {
    // given
    const stubStageRepository = {
      create2: sinon.stub(),
    };
    stubStageRepository.create2.resolves();

    const stageToCreate = {
        title: 'titre2',
        message: 'message2',
        level: 1,
        threshold: null,
        targetProfileId: 1,
      };

    // when
    await createStage({
      stageRepository: stubStageRepository,
      stageCommandCreation: stageToCreate,
    });

    // then
    const stage = domainBuilder.buildStageForCreation.withLevel({
      title: 'titre2',
      message: 'message2',
      level: 1,
      targetProfileId: 1,
    });
    expect(stubStageRepository.create2).have.been.calledWithExactly(stage);
  });

  it("should return repository method's return value", async function () {
    // given
    const stubStageRepository = {
      create2: sinon.stub(),
    };
    stubStageRepository.create2.resolves(1);

    const stage = domainBuilder.buildStageForCreation.withLevel();

    // when
    const result = await createStage({
      stageRepository: stubStageRepository,
      stageCommandCreation: stage,
    });

    // then
    expect(result).to.be.deep.equal(1);
  });
});
