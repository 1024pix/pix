import { Error as JSONAPIError } from 'jsonapi-serializer';

export default {
  serialize(infrastructureError) {
    return JSONAPIError({
      status: `${infrastructureError.status}`,
      title: infrastructureError.title,
      detail: infrastructureError.message,
      code: infrastructureError.code,
      meta: infrastructureError.meta,
    });
  },
};
