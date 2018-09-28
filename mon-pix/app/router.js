import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import { get } from '@ember/object';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

// XXX https://github.com/poteto/ember-metrics/issues/43#issuecomment-252081256
if (config.environment === 'integration' || config.environment === 'staging' || config.environment === 'production') {
  // do not make any sense in test ENV, therefore can be safely ignored
  /* istanbul ignore next */
  Router.reopen({
    metrics: service(),

    didTransition() {
      this._super(...arguments);
      this._trackPage();
    },

    _trackPage() {
      run.scheduleOnce('afterRender', this, () => {
        const page = this.get('url');
        const title = this.getWithDefault('currentRouteName', 'unknown');
        get(this, 'metrics').trackPage({ page, title });
      });
    },
  });
}

/* eslint-disable max-statements */
Router.map(function() {
  this.route('index', { path: '/' });
  this.route('inscription');
  this.route('compte');
  this.route('challenge-preview', { path: '/challenges/:challenge_id/preview' });
  this.route('courses.create-assessment', { path: '/courses/:course_id' });

  this.route('assessments.challenge', { path: '/assessments/:assessment_id/challenges/:challenge_id' });
  this.route('assessments.resume', { path: '/assessments/:assessment_id' });
  this.route('assessments.results', { path: '/assessments/:assessment_id/results' });
  this.route('assessments.comparison', { path: '/assessments/:assessment_id/results/compare/:answer_id/:index' });
  this.route('assessments.rating', { path: '/assessments/:assessment_id/rating' });
  this.route('assessments.checkpoint', { path: '/assessments/:assessment_id/checkpoint' });
  this.route('login', { path: '/connexion' });
  this.route('logout', { path: '/deconnexion' });
  this.route('board');
  this.route('reset-password', { path: '/changer-mot-de-passe/:temporaryKey' });
  this.route('password-reset-demand', { path: '/mot-de-passe-oublie' });
  this.route('certifications', function() {
    this.route('start', { path: '/' });
    this.route('resume', { path: '/:certification_course_id' });
    this.route('results', { path: '/:certification_number/results' });
  });

  this.route('user-certifications', { path: 'mes-certifications' }, function() {
    this.route('get', { path: '/:id' });
  });

  this.route('campaigns', { path: '/campagnes' }, function() {
    this.route('start-or-resume', { path: '/:campaign_code' });
    this.route('campaign-landing-page', { path: '/:campaign_code/presentation' });
    this.route('fill-in-id-pix', { path: '/:campaign_code/identifiant' });
    this.route('skill-review', { path: '/:campaign_code/resultats/:assessment_id' });
  });

  // XXX: this route is used for any request that did not match any of the previous routes. SHOULD ALWAYS BE THE LAST ONE
  this.route('not-found', { path: '/*path' });
});

export default Router;
