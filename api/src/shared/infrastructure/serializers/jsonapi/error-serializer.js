import jsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = jsonapiSerializer;

const serialize = function (infrastructureError) {
  if (!Array.isArray(infrastructureError)) infrastructureError = [infrastructureError];

  return JSONAPIError(
    infrastructureError.map((error) => {
      return {
        status: `${error.status}`,
        title: error.title,
        detail: error.message,
        code: error.code,
        meta: error.meta,
      };
    }),
  );
};

export { serialize };
