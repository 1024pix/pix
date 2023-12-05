import _ from 'lodash';
import { UseCase } from '../../domain/usecases/usecase.js';

function injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
}

function injectDependencies(toBeInjected, dependencies) {
  return _.mapValues(toBeInjected, (value) => {
    if (Object.prototype.isPrototypeOf.call(UseCase, value)) {
      return new value(dependencies);
    }
    if (_.isFunction(value)) {
      return _.partial(injectDefaults, dependencies, value)();
    } else {
      return injectDependencies(value, dependencies);
    }
  });
}

export { injectDependencies, injectDefaults };
