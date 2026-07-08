/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vendored and converted from TypeScript to JavaScript from
 * https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/instrumentation-hapi/src/instrumentation.ts
 */

import * as api from '@opentelemetry/api';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import { InstrumentationBase, InstrumentationNodeModuleDefinition, isWrapped } from '@opentelemetry/instrumentation';

import { handlerPatched, HapiComponentName } from './internal-types.js';
import {
  getExtMetadata,
  getPluginFromInput,
  getPluginName,
  getRouteMetadata,
  isDirectExtInput,
  isLifecycleExtEventObj,
  isLifecycleExtType,
  isPatchableExtMethod,
} from './utils.js';

// this package is not published, so name/version are inlined instead of generated from package.json
const PACKAGE_NAME = '@opentelemetry/instrumentation-hapi';
const PACKAGE_VERSION = '0.66.0';

/** Hapi instrumentation for OpenTelemetry */
export class HapiInstrumentation extends InstrumentationBase {
  constructor(config = {}) {
    super(PACKAGE_NAME, PACKAGE_VERSION, config);
  }

  init() {
    return new InstrumentationNodeModuleDefinition(
      HapiComponentName,
      ['>=17.0.0 <22'],
      (module) => {
        const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default : module;
        if (!isWrapped(moduleExports.server)) {
          this._wrap(moduleExports, 'server', this._getServerPatch.bind(this));
        }

        if (!isWrapped(moduleExports.Server)) {
          this._wrap(moduleExports, 'Server', this._getServerPatch.bind(this));
        }
        return moduleExports;
      },
      (module) => {
        const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default : module;
        this._massUnwrap([moduleExports], ['server', 'Server']);
      },
    );
  }

  /**
   * Patches the Hapi.server and Hapi.Server functions in order to instrument
   * the server.route, server.ext, and server.register functions via calls to the
   * _getServerRoutePatch, _getServerExtPatch, and _getServerRegisterPatch functions
   * @param original - the original Hapi Server creation function
   */
  _getServerPatch(original) {
    const instrumentation = this;
    const self = this;
    return function server(opts) {
      const newServer = original.apply(this, [opts]);

      self._wrap(newServer, 'route', (originalRouter) => {
        return instrumentation._getServerRoutePatch.bind(instrumentation)(originalRouter);
      });

      self._wrap(newServer, 'ext', (originalExtHandler) => {
        return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler);
      });

      self._wrap(newServer, 'register', instrumentation._getServerRegisterPatch.bind(instrumentation));
      return newServer;
    };
  }

  /**
   * Patches the plugin register function used by the Hapi Server. This function
   * goes through each plugin that is being registered and adds instrumentation
   * via a call to the _wrapRegisterHandler function.
   * @param original - the original register function which registers each plugin on the server
   */
  _getServerRegisterPatch(original) {
    const instrumentation = this;
    return function register(pluginInput, options) {
      if (Array.isArray(pluginInput)) {
        for (const pluginObj of pluginInput) {
          const plugin = getPluginFromInput(pluginObj);
          instrumentation._wrapRegisterHandler(plugin);
        }
      } else {
        const plugin = getPluginFromInput(pluginInput);
        instrumentation._wrapRegisterHandler(plugin);
      }
      return original.apply(this, [pluginInput, options]);
    };
  }

  /**
   * Patches the Server.ext function which adds extension methods to the specified
   * point along the request lifecycle. This function accepts the full range of
   * accepted input into the standard Hapi `server.ext` function. For each extension,
   * it adds instrumentation to the handler via a call to the _wrapExtMethods function.
   * @param original - the original ext function which adds the extension method to the server
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server extension. Else, signifies that the extension was added directly
   */
  _getServerExtPatch(original, pluginName) {
    const instrumentation = this;

    return function ext(...args) {
      if (Array.isArray(args[0])) {
        const eventsList = args[0];
        for (let i = 0; i < eventsList.length; i++) {
          const eventObj = eventsList[i];
          if (isLifecycleExtType(eventObj.type)) {
            const lifecycleEventObj = eventObj;
            const handler = instrumentation._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
            lifecycleEventObj.method = handler;
            eventsList[i] = lifecycleEventObj;
          }
        }
        return original.apply(this, args);
      } else if (isDirectExtInput(args)) {
        const extInput = args;
        const method = extInput[1];
        const handler = instrumentation._wrapExtMethods(method, extInput[0], pluginName);
        return original.apply(this, [extInput[0], handler, extInput[2]]);
      } else if (isLifecycleExtEventObj(args[0])) {
        const lifecycleEventObj = args[0];
        const handler = instrumentation._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
        lifecycleEventObj.method = handler;
        return original.call(this, lifecycleEventObj);
      }
      return original.apply(this, args);
    };
  }

  /**
   * Patches the Server.route function. This function accepts either one or an array
   * of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
   * the _wrapRouteHandler function.
   * @param original - the original route function which adds the route to the server
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server route. Else, signifies that the route was added directly
   */
  _getServerRoutePatch(original, pluginName) {
    const instrumentation = this;
    return function route(route) {
      if (Array.isArray(route)) {
        for (let i = 0; i < route.length; i++) {
          const newRoute = instrumentation._wrapRouteHandler.call(instrumentation, route[i], pluginName);
          route[i] = newRoute;
        }
      } else {
        route = instrumentation._wrapRouteHandler.call(instrumentation, route, pluginName);
      }
      return original.apply(this, [route]);
    };
  }

  /**
   * Wraps newly registered plugins to add instrumentation to the plugin's clone of
   * the original server. Specifically, wraps the server.route and server.ext functions
   * via calls to _getServerRoutePatch and _getServerExtPatch
   * @param plugin - the new plugin which is being instrumented
   */
  _wrapRegisterHandler(plugin) {
    const instrumentation = this;
    const pluginName = getPluginName(plugin);
    const oldRegister = plugin.register;
    const self = this;
    const newRegisterHandler = function (server, options) {
      self._wrap(server, 'route', (original) => {
        return instrumentation._getServerRoutePatch.bind(instrumentation)(original, pluginName);
      });

      self._wrap(server, 'ext', (originalExtHandler) => {
        return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler, pluginName);
      });
      return oldRegister.call(this, server, options);
    };
    plugin.register = newRegisterHandler;
  }

  /**
   * Wraps request extension methods to add instrumentation to each new extension handler.
   * Patches each individual extension in order to create the
   * span and propagate context. It does not create spans when there is no parent span.
   * @param method - the request extension handler which is being instrumented
   * @param extPoint - the point in the Hapi request lifecycle which this extension targets
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server route. Else, signifies that the route was added directly
   */
  _wrapExtMethods(method, extPoint, pluginName) {
    const instrumentation = this;
    if (method instanceof Array) {
      for (let i = 0; i < method.length; i++) {
        method[i] = instrumentation._wrapExtMethods(method[i], extPoint);
      }
      return method;
    } else if (isPatchableExtMethod(method)) {
      if (method[handlerPatched] === true) return method;
      method[handlerPatched] = true;

      const newHandler = async function (...params) {
        if (api.trace.getSpan(api.context.active()) === undefined) {
          return await method.apply(this, params);
        }
        const metadata = getExtMetadata(extPoint, pluginName, method.name);
        const span = instrumentation.tracer.startSpan(metadata.name, {
          attributes: metadata.attributes,
        });
        try {
          return await api.context.with(api.trace.setSpan(api.context.active(), span), method, undefined, ...params);
        } catch (err) {
          span.recordException(err);
          span.setStatus({
            code: api.SpanStatusCode.ERROR,
            message: err.message,
          });
          throw err;
        } finally {
          span.end();
        }
      };
      return newHandler;
    }
    return method;
  }

  /**
   * Patches each individual route handler method in order to create the
   * span and propagate context. It does not create spans when there is no parent span.
   * @param route - the route handler which is being instrumented
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server route. Else, signifies that the route was added directly
   */
  _wrapRouteHandler(route, pluginName) {
    const instrumentation = this;
    if (route[handlerPatched] === true) return route;
    route[handlerPatched] = true;

    const wrapHandler = (oldHandler) => {
      return async function (...params) {
        if (api.trace.getSpan(api.context.active()) === undefined) {
          return await oldHandler.call(this, ...params);
        }
        const rpcMetadata = getRPCMetadata(api.context.active());
        if (rpcMetadata?.type === RPCType.HTTP) {
          rpcMetadata.route = route.path;
        }
        const metadata = getRouteMetadata(route, pluginName);
        const span = instrumentation.tracer.startSpan(metadata.name, {
          attributes: metadata.attributes,
        });
        try {
          return await api.context.with(api.trace.setSpan(api.context.active(), span), () =>
            oldHandler.call(this, ...params),
          );
        } catch (err) {
          span.recordException(err);
          span.setStatus({
            code: api.SpanStatusCode.ERROR,
            message: err.message,
          });
          throw err;
        } finally {
          span.end();
        }
      };
    };

    if (typeof route.handler === 'function') {
      route.handler = wrapHandler(route.handler);
    } else if (typeof route.options === 'function') {
      const oldOptions = route.options;
      route.options = function (server) {
        const options = oldOptions(server);
        if (typeof options.handler === 'function') {
          options.handler = wrapHandler(options.handler);
        }
        return options;
      };
    } else if (typeof route.options?.handler === 'function') {
      route.options.handler = wrapHandler(route.options.handler);
    }
    return route;
  }
}
