import EmberRouter from '@ember/routing/router';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import config from './config/environment';
import { get } from '@ember/object';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
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
    }
  });
}

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('courses');
  this.route('placement-tests');
  this.route('project', { path: '/projet' });
  this.route('competences');
  this.route('inscription');
  this.route('compte');
  this.route('enrollment', { path: '/rejoindre' });
  this.route('challenge-preview', { path: '/challenges/:challenge_id/preview' });
  this.route('courses.create-assessment', { path: '/courses/:course_id' });
  this.route('assessments.challenge', { path: '/assessments/:assessment_id/challenges/:challenge_id' });
  this.route('assessments.resume', { path: '/assessments/:assessment_id' });
  this.route('assessments.results', { path: '/assessments/:assessment_id/results' });
  this.route('assessments.comparison', { path: '/assessments/:assessment_id/results/compare/:answer_id/:index' });
  this.route('certifications.results', { path: '/certifications/:certification_number/results' });
  this.route('login', { path: '/connexion' });
  this.route('logout', { path: '/deconnexion' });
  this.route('course-groups', { path: '/defis-pix' });
  this.route('board');
  this.route('legal-notices', { path: '/mentions-legales' });
  this.route('terms-of-service', { path: '/conditions-generales-d-utilisation' });
  this.route('reset-password', { path: '/changer-mot-de-passe/:temporaryKey' });
  this.route('password-reset-demand', { path: '/mot-de-passe-oublie' });
  this.route('not-found', { path: '/*path' });
  this.route('certification-course', { path: '/certifications' });
  this.route('certifications.resume', { path: '/certifications/:certification_course_id' });

});

export default Router;
