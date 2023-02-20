import _ from 'lodash';

function injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
}

function injectDependencies(toBeInjected, dependencies) {
  return _.mapValues(toBeInjected, _.partial(injectDefaults, dependencies));
}

export default { injectDependencies, injectDefaults };
