import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  // authentication
  this.route('login');

  // public routes
  this.route('about');

  // private routes
  this.route('authenticated', { path: '' }, function() {
    // all routes that require the session to be authenticated
    this.route('organizations', function() {
      this.route('new');
      this.route('list');
    });
  });
  this.route('logout');
});

export default Router;
