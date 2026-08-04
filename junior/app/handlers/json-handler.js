export const JsonHandler = {
  request(context, next) {
    const headers = new Headers(context.request.headers);
    headers.set('Content-Type', 'application/json');

    return next(Object.assign({}, context.request, { headers }));
  },
};
