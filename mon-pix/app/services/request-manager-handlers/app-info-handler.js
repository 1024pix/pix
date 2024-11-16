import ENV from 'mon-pix/config/environment';

/**
 * Request manager handler adding application info in request headers.
 * See: https://github.com/emberjs/data/blob/main/guides/requests/examples/1-auth.md
 */
export default class AppInfoHandler {
  request(context, next) {
    const headers = new Headers(context.request.headers);

    headers.append('X-App-Version', ENV.APP.APP_VERSION);

    return next(Object.assign({}, context.request, { headers }));
  }
}
