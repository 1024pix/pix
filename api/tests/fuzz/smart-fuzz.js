// Created by William Riley-Land
// Copyright © 2018 NearForm Ltd.

const Felicity = require('felicity');
const XRegExp = require('xregexp');

const matchPathParameter = (name = '[^}]+') =>
  XRegExp(
    `
  [{]     # the opening brace of the path parameter
  ${name} # the name of the path parameter (can be a regular expression string)
  [*]?    # the name is optionally followed by an asterisk
  [}]     # the closing brace of the path parameter
`,
    'x'
  );

module.exports = async ({ defaultHeaders, server }) => {
  const routes = server.table();
  // We're OK with any 2xx, 3xx, 4xx, should not get 5xx.  This is testing that
  // the code runs, and that any errors that might be encountered are
  // appropriately caught, handled, and reflected in the response.  BUT it's
  // important to note the caveat that this may not be exhaustive or cover every
  // or even the normal code path.
  const routeTests = routes.map(async (route) => {
    const { method, path, settings } = route;
    const { validate } = settings;

    const { headers, params, payload, query } = validate;

    const validPayload = payload ? Felicity.example(payload) : null;
    const validHeaders = headers ? Felicity.example(headers) : null;
    const validParams = params ? Felicity.example(params) : null;
    const validPath = validParams
      ? Object.entries(validParams).reduce((a, b) => a.replace(matchPathParameter(b[0]), b[1]), path)
      : path.replace(matchPathParameter(), 'ajklsdfjklasdf');
    const validQuery = query ? Felicity.example(query) : null;
    const urlParams = new URLSearchParams(validQuery);
    const validQueryString = validQuery ? `?${urlParams.toString()}` : '';
    const url = `${validPath}${validQueryString}`;
    const testResponse = await server.inject({
      payload: validPayload,
      headers: Object.assign({}, validHeaders, defaultHeaders),
      method,
      url,
    });
    const { statusCode } = testResponse;

    if (statusCode >= 500) {
      console.log(url, method, validPayload, statusCode);
      throw new Error(`Fuzz test caused a ${statusCode} response.`);
    }
  });

  await Promise.all(routeTests);
};
