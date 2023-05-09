import { expect } from '../../../test-helper.js';
import { injectDependencies } from '../../../../lib/infrastructure/utils/dependency-injection.js';

describe('Unit | Utils | #injectDependencies', function () {
  it('should inject dependencies by name', function () {
    // given
    const dependency = Symbol('a dependency');
    const dependencies = { dependency };
    const toBeInjected = {
      functionToBeInjected: function ({ dependency }) {
        return dependency;
      },
    };

    // when
    const injected = injectDependencies(toBeInjected, dependencies);

    // then
    expect(injected.functionToBeInjected({})).to.equal(dependency);
  });
});
