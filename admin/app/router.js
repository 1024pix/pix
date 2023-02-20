import EmberRouter from '@ember/routing/router';
import config from 'pix-admin/config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    this.on('routeDidChange', () => {
      window.scrollTo(0, 0);
    });
  }
}

Router.map(function () {
  // authentication
  this.route('login');
  this.route('logout');

  // private routes
  this.route('authenticated', { path: '' }, function () {
    // all routes that require the session to be authenticated
    this.route('organizations', function () {
      this.route('new');
      this.route('list');
      this.route('get', { path: '/:organization_id' }, function () {
        this.route('team');
        this.route('target-profiles');
        this.route('campaigns');
        this.route('all-tags');
        this.route('places', function () {
          this.route('list', { path: '/' });
          this.route('new');
        });
        this.route('invitations');
      });
    });

    this.route('campaigns', function () {
      this.route('campaign', { path: '/:campaign_id' }, function () {
        this.route('participations');
      });
    });

    this.route('users', function () {
      this.route('list');
      this.route('get', { path: '/:user_id' }, function () {
        this.route('information', { path: '/' });
        this.route('profile');
        this.route('campaign-participations', { path: '/participations' });
        this.route('organizations');
        this.route('certification-center-memberships');
      });
    });

    this.route('team', { path: '/equipe' }, function () {
      this.route('list', { path: '/' });
    });

    this.route('certification-centers', function () {
      this.route('get', { path: '/:certification_center_id' }, function () {
        this.route('team', { path: '/' });
        this.route('invitations');
      });
      this.route('list');
      this.route('new');
    });

    this.route('sessions', function () {
      this.route('list', function () {
        this.route('all', { path: '/' });
        this.route('to-be-published');
        this.route('with-required-action');
      });
      this.route('session', { path: '/:session_id' }, function () {
        this.route('informations', { path: '/' });
        this.route('certifications');
      });
    });

    this.route('certifications', function () {
      this.route('certification', { path: '/:certification_id' }, function () {
        this.route('informations', { path: '/' });
        this.route('neutralization');
        this.route('details');
        this.route('profile');
      });
    });

    this.route('target-profiles', function () {
      this.route('list');
      this.route('new');
      this.route('target-profile', { path: '/:target_profile_id' }, function () {
        this.route('details');
        this.route('organizations');
        this.route('insights');
        this.route('badges', function () {
          this.route('new');
          this.route('badge', { path: '/:badge_id' });
        });
        this.route('stages', function () {
          this.route('stage', { path: '/:stage_id' });
        });
      });
    });

    this.route('trainings', function () {
      this.route('list');
      this.route('new');
      this.route('training', { path: '/:training_id' }, function () {
        this.route('triggers', function () {
          this.route('edit');
        });
        this.route('target-profiles');
      });
    });

    this.route('administration');
    this.route('tools');
  });
});

export default Router;
