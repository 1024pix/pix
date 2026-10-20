/**
 * Request manager handler to manage JSON request.
 * See: https://github.com/emberjs/data/blob/main/guides/requests/examples/1-auth.md
 */
export default class JsonHandler {
  request(context, next) {
    const headers = new Headers(context.request.headers);

    headers.append('Accept', 'application/json');

    if (!(context.request.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    return next(Object.assign({}, context.request, { headers }));
  }
}
