import EmberRouter from '@ember/routing/router';
import config from 'auth/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('authentication', { path: '/connexion' }, function () {
    this.route('login-oidc', { path: '/:identity_provider_slug' });
  });
});
