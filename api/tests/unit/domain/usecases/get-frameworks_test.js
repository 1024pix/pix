const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | get-frameworks', function () {
  let frameworkRepository;

  beforeEach(function () {
    frameworkRepository = {
      list: sinon.stub(),
    };
  });

  it('should call frameworkRepository.list', async function () {
    // when
    await usecases.getFrameworks({
      frameworkRepository,
    });

    expect(frameworkRepository.list).to.have.been.called;
  });
});
