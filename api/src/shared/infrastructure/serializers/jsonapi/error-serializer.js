import jsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = jsonapiSerializer;

/**
 * @typedef HttpError
 * @type {object}
 * @property {string} id
 * @property {number} status
 * @property {string} title
 * @property {string} message
 * @property {string} code
 * @property {object|string} meta
 * @property {object} source
 */

/**
 *
 * @param {Array<HttpError>|HttpError} infrastructureError
 * @return {JSONAPIError}
 */
const serialize = function (infrastructureError) {
  if (!Array.isArray(infrastructureError)) infrastructureError = [infrastructureError];

  return JSONAPIError(
    infrastructureError.map((error) => {
      return {
        id: error.id,
        status: `${error.status}`,
        title: error.title,
        detail: error.message,
        code: error.code,
        meta: error.meta,
        source: error.source,
      };
    }),
  );
};

export const errorSerializer = { serialize };
