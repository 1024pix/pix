import { inject as service } from '@ember/service';

/**
 * Request manager handler adding authentication credentials in the request.
 * See: https://github.com/emberjs/data/blob/main/guides/requests/examples/1-auth.md
 */
export default class AuthHandler {
  @service session;

  request(context, next) {
    const headers = new Headers(context.request.headers);

    const { isAuthenticated, data } = this.session;
    if (isAuthenticated) {
      headers.append('Authorization', `Bearer ${data.authenticated.access_token}`);
    }

    return next(Object.assign({}, context.request, { headers }));
  }
}
