import _ from 'lodash';

import { otelProxy } from '../open-telemetry/otel_proxy.js';

function injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
}

/**
 * Transforms a function type `BaseFunction` so that keys present in dependencies `Dependencies` become optional.
 *
 * @template BaseFunction
 * @template {object} Dependencies
 * @typedef {BaseFunction extends (args: infer FunctionArgs) => infer FunctionResult
 *   ? (args: Omit<FunctionArgs, keyof Dependencies> & Partial<FunctionArgs>) => FunctionResult
 *   : BaseFunction
 * } MergeDeps
 */

/**
 * Recursively traverses the object `BaseObject` to apply MergeDeps with the dependencies `Dependencies` to all its functions.
 *
 * @template {object} BaseObject
 * @template {object} Dependencies
 * @typedef {{
 *   [Key in keyof BaseObject]: BaseObject[Key] extends Function
 *     ? MergeDeps<BaseObject[Key], Dependencies>
 *     : Inject<BaseObject[Key], Dependencies>
 * }} Inject
 */

/**
 * @typedef {{
 *   name: string
 * }} BoundedContext
 */

/**
 * @template {object} ObjectToBeInjected
 * @template {object} DependenciesToInject
 * @param {ObjectToBeInjected} toBeInjected - An object (or nested objects) of functions.
 * @param {DependenciesToInject} dependencies - An object of dependencies to inject.
 * @param {BoundedContext=} boundedContext
 * @returns {Inject<ObjectToBeInjected, DependenciesToInject>} The input object, but functions now only require dependencies that haven't been injected.
 */
export function injectDependencies(toBeInjected, dependencies, boundedContext = { name: 'unknown' }) {
  const defaultAttributes = {
    'boundedContext.name': boundedContext.name,
  };
  const wrappedDependencies = Object.fromEntries(
    Object.entries(dependencies).map(([name, value]) => [
      name,
      value ? otelProxy(value, name, defaultAttributes) : value,
    ]),
  );
  const injected = Object.fromEntries(
    Object.entries(toBeInjected).map(([name, value]) => {
      if (_.isFunction(value)) {
        const wrapped = otelProxy(value, `${boundedContext.name}->${name}`, defaultAttributes);
        return [name, _.partial(injectDefaults, wrappedDependencies, wrapped)()];
      } else {
        return [name, injectDependencies(value, dependencies)];
      }
    }),
  );

  return injected;
}
