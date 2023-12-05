import { expect } from '../../../../test-helper.js';
import { injectDependencies } from '../../../../../src/shared/infrastructure/utils/dependency-injection.js';
import { UseCase } from '../../../../../src/shared/domain/usecases/usecase.js';

describe('Unit | Utils | #injectDependencies', function () {
  context('when the object value to be injected is a function', function () {
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

  context('when the object value to be injected is a prototype of UseCase class', function () {
    it('should inject dependencies by name', function () {
      // given
      const dependency = Symbol('a dependency');
      const dependencies = { dependency };
      class TestUseCase extends UseCase {
        constructor({ dependency }) {
          super();
          this.dependency = dependency;
        }
        execute() {
          return this.dependency;
        }
      }
      const toBeInjected = {
        myClass: TestUseCase,
      };

      // when
      const injected = injectDependencies(toBeInjected, dependencies);

      // then
      expect(injected.myClass.execute()).to.equal(dependency);
    });
  });

  context('when the object value to be injected is an arrow function', function () {
    it('should inject dependencies by name', function () {
      // given
      const dependency = Symbol('a dependency');
      const dependencies = { dependency };
      const toBeInjected = {
        functionToBeInjected: ({ dependency }) => {
          return dependency;
        },
      };

      // when
      const injected = injectDependencies(toBeInjected, dependencies);

      // then
      expect(injected.functionToBeInjected({})).to.equal(dependency);
    });
  });

  context('when the object value to be injected is an async arrow function', function () {
    it('should inject dependencies by name', async function () {
      // given
      const dependency = Symbol('a dependency');
      const dependencies = { dependency };
      const toBeInjected = {
        functionToBeInjected: async ({ dependency }) => {
          return dependency;
        },
      };

      // when
      const injected = injectDependencies(toBeInjected, dependencies);

      // then
      expect(await injected.functionToBeInjected({})).to.equal(dependency);
    });
  });

  context('when the object value to be injected is an async function', function () {
    it('should inject dependencies by name', async function () {
      // given
      const dependency = Symbol('a dependency');
      const dependencies = { dependency };
      const toBeInjected = {
        functionToBeInjected: async function ({ dependency }) {
          return dependency;
        },
      };

      // when
      const injected = injectDependencies(toBeInjected, dependencies);

      // then
      expect(await injected.functionToBeInjected({})).to.equal(dependency);
    });
  });

  context('when the object value to be injected is an object containing function', function () {
    it('should inject dependencies by name', function () {
      // given
      const dependency = Symbol('a dependency');
      const dependencies = { dependency };
      const toBeInjected = {
        functions: {
          functionToBeInjected: function ({ dependency }) {
            return dependency;
          },
          functionToBeInjected2: function ({ dependency }) {
            return dependency;
          },
        },
        functions2: {
          functionToBeInjected3: function ({ dependency }) {
            return dependency;
          },
        },
      };

      // when
      const injected = injectDependencies(toBeInjected, dependencies);

      // then
      expect(injected.functions.functionToBeInjected({})).to.equal(dependency);
      expect(injected.functions.functionToBeInjected2({})).to.equal(dependency);
      expect(injected.functions2.functionToBeInjected3({})).to.equal(dependency);
    });
  });

  it('should be possible to pass args to the injected function', function () {
    // given
    const dependency = Symbol('a dependency');
    const arg = Symbol('an arg');
    const dependencies = { dependency };
    const toBeInjected = {
      functionToBeInjected: function ({ dependency, arg }) {
        return { dependency, arg };
      },
    };

    const injected = injectDependencies(toBeInjected, dependencies);

    // when
    const result = injected.functionToBeInjected({ arg });

    // then
    expect(result).to.deep.equal({ dependency, arg });
  });

  context('when the function arg is not an object', function () {
    it('should not inject dependencies', function () {
      // given
      const dependency = Symbol('a dependency');
      const dependencies = { dependency };
      const toBeInjected = {
        functionToBeInjected: function (dependency) {
          return dependency;
        },
      };

      // when
      const injected = injectDependencies(toBeInjected, dependencies);

      // then
      expect(injected.functionToBeInjected({})).to.be.empty;
    });
  });
});
