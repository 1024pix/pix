import EmberRouter from '@ember/routing/router';
import { service } from '@ember/service';
import config from 'pix-admin/config/environment';

export default class Router extends EmberRouter {
  @service pixToast;

  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);
    this.on('routeDidChange', (transition) => {
      if (transition.from && transition.to.name !== transition.from.name) {
        const isTransitionFromCreateOrUpdate = ['.edit', '.new', '.update'].every((route) =>
          transition.from.name.includes(route),
        );
        const isFromSameParent = transition.to.parent.name.includes(transition.from.parent.name);

        if (!isFromSameParent && isTransitionFromCreateOrUpdate) {
          this.pixToast.removeAllNotifications();
        }
        window.scrollTo(0, 0);
      }
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
    this.route('quest-creator');
    this.route('quest-new-or-edit-snippet');
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
        this.route('children');
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
        this.route('authentication-methods');
        this.route('profile');
        this.route('campaign-participations', { path: '/participations' });
        this.route('organizations');
        this.route('certification-center-memberships');
        this.route('certification-courses', { path: '/certifications' });
        this.route('cgu');
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
        this.route('candidates', function () {
          this.route('timeline');
        });
      });
      this.route('certification', { path: '/certification/:certification_id' }, function () {
        this.route('informations', { path: '/' });
        this.route('neutralization');
        this.route('details');
        this.route('profile');
      });
    });

    this.route('candidates', function () {
      this.route('timeline', { path: '/:candidate_id/timeline' });
    });

    this.route('complementary-certifications', function () {
      this.route('list');
      this.route('item', { path: '/:complementary_certification_id' }, function () {
        this.route('framework', function () {
          this.route('new');
        });
        this.route('target-profile', function () {
          this.route('update', { path: '/:target_profile_id' });
          this.route('new');
        });
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
        this.route('training-summaries');
      });
      this.route('edit', { path: '/:target_profile_id/edit' });
    });

    this.route('autonomous-courses', function () {
      this.route('new');
      this.route('details', { path: '/:autonomous_course_id' });
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

    this.route('administration', function () {
      this.route('common');
      this.route('campaigns');
      this.route('organizations');
      this.route('certification');
      this.route('deployment');
      this.route('access');
    });

    this.route('tools', function () {
      this.route('campaigns');
      this.route('certification');
      this.route('junior');
    });

    this.route('smart-random-simulator', function () {
      this.route('get-next-challenge');
    });

    this.route('combined-course-blueprints', function () {
      this.route('list');
      this.route('create');
    });
  });

  this.route('authentication', { path: '/connexion' }, function () {
    this.route('login-oidc', { path: '/:identity_provider_slug' });
  });
});
