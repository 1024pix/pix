import _ from 'lodash';

function injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
}

function injectDependencies(toBeInjected, dependencies) {
  return _.mapValues(toBeInjected, (value) => {
    if (_.isFunction(value)) {
      return _.partial(injectDefaults, dependencies, value)();
    } else {
      return injectDependencies(value, dependencies);
    }
  });
}

export { injectDefaults, injectDependencies };
