import sinon from 'sinon';

import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | UseCase | find-frameworks-by-ids', function () {
  let frameworkRepository;

  beforeEach(function () {
    frameworkRepository = {
      findByIds: sinon.stub(),
    };
  });

  it('calls frameworkRepository.findByIds', async function () {
    // given
    const ids = Symbol('ids');
    const frameworks = Symbol('frameworks');
    frameworkRepository.findByIds.resolves(frameworks);

    // when
    const result = await usecases.findFrameworksByIds({ ids, frameworkRepository });

    // then
    expect(frameworkRepository.findByIds).to.have.been.calledOnceWithExactly(ids);
    expect(result).to.equal(frameworks);
  });
});
