/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vendored and converted from TypeScript to JavaScript from
 * https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/instrumentation-hapi/src/utils.ts
 */

import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE } from '@opentelemetry/semantic-conventions';

import { AttributeNames } from './enums/attribute-names.js';
import { HapiLayerType, HapiLifecycleMethodNames } from './internal-types.js';

export function getPluginName(plugin) {
  if (plugin.name) {
    return plugin.name;
  } else {
    return plugin.pkg.name;
  }
}

export const isLifecycleExtType = (variableToCheck) => {
  return typeof variableToCheck === 'string' && HapiLifecycleMethodNames.has(variableToCheck);
};

export const isLifecycleExtEventObj = (variableToCheck) => {
  const event = variableToCheck?.type;
  return event !== undefined && isLifecycleExtType(event);
};

export const isDirectExtInput = (variableToCheck) => {
  return (
    Array.isArray(variableToCheck) &&
    variableToCheck.length <= 3 &&
    isLifecycleExtType(variableToCheck[0]) &&
    typeof variableToCheck[1] === 'function'
  );
};

export const isPatchableExtMethod = (variableToCheck) => {
  return !Array.isArray(variableToCheck);
};

export const getRouteMetadata = (route, pluginName) => {
  const attributes = {
    [ATTR_HTTP_ROUTE]: route.path,
  };
  // Note: This currently does *not* normalize the method name to uppercase
  // and conditionally include `http.request.method.original` as described
  // at https://opentelemetry.io/docs/specs/semconv/http/http-spans/
  // These attributes are for a *hapi* span, and not the parent HTTP span,
  // so the HTTP span guidance doesn't strictly apply.
  attributes[ATTR_HTTP_REQUEST_METHOD] = route.method;

  let name;
  if (pluginName) {
    attributes[AttributeNames.HAPI_TYPE] = HapiLayerType.PLUGIN;
    attributes[AttributeNames.PLUGIN_NAME] = pluginName;
    name = `${pluginName}: route - ${route.path}`;
  } else {
    attributes[AttributeNames.HAPI_TYPE] = HapiLayerType.ROUTER;
    name = `route - ${route.path}`;
  }

  return { attributes, name };
};

export const getExtMetadata = (extPoint, pluginName, methodName) => {
  let baseName = `ext - ${extPoint}`;
  if (methodName && methodName !== 'method') {
    // method is the default name for the extension in the ServerExtEventsObject format.
    baseName = `ext - ${extPoint} - ${methodName}`;
  }
  if (pluginName) {
    return {
      attributes: {
        [AttributeNames.EXT_TYPE]: extPoint,
        [AttributeNames.HAPI_TYPE]: HapiLayerType.EXT,
        [AttributeNames.PLUGIN_NAME]: pluginName,
      },
      name: `${pluginName}: ${baseName}`,
    };
  }
  return {
    attributes: {
      [AttributeNames.EXT_TYPE]: extPoint,
      [AttributeNames.HAPI_TYPE]: HapiLayerType.EXT,
    },
    name: baseName,
  };
};

export const getPluginFromInput = (pluginObj) => {
  if ('plugin' in pluginObj) {
    if ('plugin' in pluginObj.plugin) {
      return pluginObj.plugin.plugin;
    }
    return pluginObj.plugin;
  }
  return pluginObj;
};
