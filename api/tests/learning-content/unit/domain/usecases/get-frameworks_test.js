import sinon from 'sinon';

import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';

describe('Unit | UseCase | get-frameworks', function () {
  let sharedFrameworkRepository;

  beforeEach(function () {
    sharedFrameworkRepository = {
      list: sinon.stub(),
    };
  });

  it('should call sharedFrameworkRepository.list', async function () {
    // when
    await usecases.getFrameworks({
      sharedFrameworkRepository,
    });

    expect(sharedFrameworkRepository.list).to.have.been.called;
  });
});
