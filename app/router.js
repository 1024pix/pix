import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('login');
  this.route('about');
  this.route('authenticated', { path: '' }, function() {
    // all routes that require the session to be authenticated
    this.route('protected');
  });
});

export default Router;
