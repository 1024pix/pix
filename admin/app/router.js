import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  metrics: service(),

  didTransition() {
    this._super(...arguments);
    this._trackPage();
  },

  _trackPage() {
    scheduleOnce('afterRender', this, () => {
      const page = this.get('url');
      const title = this.getWithDefault('currentRouteName', 'unknown');
      this.get('metrics').trackPage({ page, title });
    });
  }
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
      this.route('get', { path: '/:organization_id' });
    });
    this.route('certifications', function() {
      //TODO: find a better routes settings between info and details
      this.route('single', function() {
        this.route('info', { path: '/:certification_id' });
        this.route('details', { path: '/:certification_id/details' });
      });
      this.route('sessions', function() {
        this.route('info', { path: '/:session_id' }, function() {
          this.route('list', { path: '/list' });
        });
      });
    });
    this.route('users', function() {
      this.route('list');
    });
  });
});

export default Router;
