import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', { path: '/' });

  // authentication
  this.route('login');
  this.route('logout');

  // public routes
  this.route('about');

  // private routes
  this.route('dashboard');
  this.route('protected');
  this.route('users');
});

export default Router;
