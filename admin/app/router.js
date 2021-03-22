/* eslint-disable ember/classic-decorator-hooks */

import EmberRouter from '@ember/routing/router';
import config from 'pix-admin/config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  init() {
    super.init(...arguments);
    this.on('routeDidChange', () => {
      window.scrollTo(0, 0);
    });
  }
}

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
      this.route('get', { path: '/:organization_id' }, function() {
        this.route('members');
        this.route('target-profiles');
      });
    });

    this.route('users', function() {
      this.route('list');
      this.route('get', { path: '/:user_id' });
    });

    this.route('certification-centers', function() {
      this.route('get', { path: '/:certification_center_id' });
      this.route('list');
      this.route('new');
    });

    this.route('sessions', function() {
      this.route('list', function() {
        this.route('all', { path: '/' });
        this.route('to-be-published');
        this.route('with-required-action');
      });
      this.route('session', { path: '/:session_id' }, function() {
        this.route('informations', { path: '/' });
        this.route('certifications');
      });
    });

    this.route('certifications', function() {
      this.route('certification', { path: '/:certification_id' }, function() {
        this.route('informations', { path: '/' });
        this.route('neutralization');
        this.route('details');
        this.route('profile');
      });
    });

    this.route('target-profiles', function() {
      this.route('list');
      this.route('new');
      this.route('target-profile', { path: '/:target_profile_id' }, function() {
        this.route('details', { path: '/' });
        this.route('organizations');
        this.route('insight');
      });
    });

    this.route('stages', function() {
      this.route('stage', { path: '/:stage_id' });
    });

    this.route('tools');
  });
});

export default Router;
