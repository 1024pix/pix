import sinon from 'sinon';

import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | UseCase | get-frameworks', function () {
  let frameworkRepository;

  beforeEach(function () {
    frameworkRepository = {
      list: sinon.stub(),
    };
  });

  it('calls frameworkRepository.list', async function () {
    // when
    await usecases.getFrameworks({ frameworkRepository });

    // then
    expect(frameworkRepository.list).to.have.been.calledOnceWithExactly();
  });
});
