import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

// XXX https://github.com/poteto/ember-metrics/issues/43#issuecomment-252081256
if (config.environment === 'integration' || config.environment === 'staging' || config.environment === 'production') {
  // do not make any sense in test ENV, therefore can be safely ignored
  /* istanbul ignore next */
  Router.reopen({
    metrics: Ember.inject.service(),

    didTransition() {
      this._super(...arguments);
      this._trackPage();
    },

    _trackPage() {
      Ember.run.scheduleOnce('afterRender', this, () => {
        const page = this.get('url');
        const title = this.getWithDefault('currentRouteName', 'unknown');
        Ember.get(this, 'metrics').trackPage({ page, title });
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

  this.route('challenges.get-preview', { path: '/challenges/:challenge_id/preview' });

  this.route('courses.get-course-preview', { path: '/courses/:course_id/preview' });
  this.route('courses.get-challenge-preview', { path: '/courses/:course_id/preview/challenges/:challenge_id' });
  this.route('courses.create-assessment', { path: '/courses/:course_id' });
  this.route('courses.create-assessment-old', { path: '/courses/:course_id/assessment' });

  this.route('assessments.get-challenge', { path: '/assessments/:assessment_id/challenges/:challenge_id' });
  this.route('assessments.get-results', { path: '/assessments/:assessment_id/results' });
  this.route('assessments.get-comparison', { path: '/assessments/:assessment_id/results/compare/:answer_id/:index' });
});

export default Router;
