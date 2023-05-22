import jsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = jsonapiSerializer;

const serialize = function (infrastructureError) {
  return JSONAPIError({
    status: `${infrastructureError.status}`,
    title: infrastructureError.title,
    detail: infrastructureError.message,
    code: infrastructureError.code,
    meta: infrastructureError.meta,
  });
};

export { serialize };
