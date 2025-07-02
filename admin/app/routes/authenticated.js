import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service session;

  beforeModel(transition) {
    // todo(auth)
    const encodedRedirectUri = encodeURIComponent(`${window.location.href}`);
    const authRoute = `http://localhost:4206?redirect_uri=${encodedRedirectUri}`;
    this.session.requireAuthentication(transition, () => {
      window.location = authRoute;
    });
  }
}
