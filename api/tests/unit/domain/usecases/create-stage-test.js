const { expect, sinon, catchErr } = require('../../../test-helper');
const createStage = require('../../../../lib/domain/usecases/create-stage');
const stageValidator = require('../../../../lib/domain/validators/stage-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-stage', function() {
  beforeEach(function() {
    sinon.stub(stageValidator, 'validate');
  });

  it('should throw an EntityValidationError if stage is not valid', async function() {
    // given
    stageValidator.validate.throws(new EntityValidationError({ invalidAttributes: [] }));

    // when
    const error = await catchErr(createStage)({ });

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  it('should call the stage repository', async function() {
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
