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

module.exports = function routeTest(route) {
  const { path, settings } = route;
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
  return {
    url,
    payload: validPayload,
    headers: validHeaders,
  };
};
