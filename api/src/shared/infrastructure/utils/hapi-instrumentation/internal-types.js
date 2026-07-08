/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vendored and converted from TypeScript to JavaScript from
 * https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/instrumentation-hapi/src/internal-types.ts
 * Only the runtime values are kept, the original file's type-only exports have no JS equivalent.
 */

export const HapiComponentName = '@hapi/hapi';

/**
 * This symbol is used to mark a Hapi route handler or server extension handler as
 * already patched, since its possible to use these handlers multiple times
 * i.e. when allowing multiple versions of one plugin, or when registering a plugin
 * multiple times on different servers.
 */
export const handlerPatched = Symbol('hapi-handler-patched');

export const HapiLayerType = {
  ROUTER: 'router',
  PLUGIN: 'plugin',
  EXT: 'server.ext',
};

export const HapiLifecycleMethodNames = new Set([
  'onPreAuth',
  'onCredentials',
  'onPostAuth',
  'onPreHandler',
  'onPostHandler',
  'onPreResponse',
  'onRequest',
]);
