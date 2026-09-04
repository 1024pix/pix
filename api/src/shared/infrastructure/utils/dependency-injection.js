import { glob } from 'node:fs/promises';
import {join} from 'node:path'
import {cwd} from 'node:process'
import { pathToFileURL } from 'node:url';

import _ from 'lodash';

import { tracing } from '../open-telemetry/helpers.js';

async function isForDomain(value) {
  return async (filePath) => {
    const mod = await import(pathToFileURL(filePath).href);
    const ExportedClass = mod.default;

    if (value instanceof ExportedClass) { /* ... */ }
  }
}

function makeInjectDefaults(boundedContext) {
  return (defaults, targetFn) => {
    return async (args) => {
      console.log(targetFn)
      const result = await targetFn(Object.assign(Object.create(defaults), args))
      console.log({ result })
      const pathToModels = join(cwd(), 'src', 'quest', 'domain', 'models')
      console.log({ pathToModels })
      const modelFiles = []
      for await (const entry of glob(join(pathToModels, '**/*.js')))
        modelFiles.push(entry)

      let found = false

      for (const filePath of modelFiles) {
        const mod = await import(pathToFileURL(filePath).href);
        const ExportedClass = mod[Object.keys(mod)[0]];
        if (typeof ExportedClass !== 'function') {
          continue;
        }
        console.log(result.constructor.name, filePath, typeof ExportedClass, ExportedClass)
        if (result instanceof ExportedClass) {
          found = true
        }
      }

      if (!found) {
        throw Error('NOT A DOMAIN MODEL')
      }

      console.log({ found })

      return result
    }
  }
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
      value ? tracing.spanify(name, value, () => ({ attributes: defaultAttributes })) : value,
    ]),
  );
  const injected = Object.fromEntries(
    Object.entries(toBeInjected).map(([name, value]) => {
      if (_.isFunction(value)) {
        const wrapped = tracing.spanify(`${boundedContext.name}->${name}`, value, () => ({
          attributes: defaultAttributes,
        }));
        return [name, _.partial(makeInjectDefaults(boundedContext.name), wrappedDependencies, wrapped)()];
      } else {
        return [name, injectDependencies(value, dependencies)];
      }
    }),
  );

  return injected;
}
