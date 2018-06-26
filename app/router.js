import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  // authentication
  this.route('login');
  this.route('logout');

  // public routes
  this.route('index');
  this.route('about');

  // private routes
  this.route('authenticated', { path: '' }, function() {
    // all routes that require the session to be authenticated
    this.route('organizations', function() {
      this.route('new');
      this.route('list');
    });
    this.route('certifications', function() {
      this.route('menu');
      this.route('single', function() {
        this.route('info', {path:'/:certification_id'});
        this.route('details', {path:'/:certification_id/details'});
      });
    });
  });
});

export default Router;
