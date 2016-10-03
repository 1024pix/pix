import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {

  this.route('index', { path: '/' });
  this.route('home');
  this.route('preferences');

  this.route('challenges.get-preview', { path: '/challenges/:challenge_id/preview' });

  this.route('courses.get-course-preview', { path: '/courses/:course_id/preview' });
  this.route('courses.get-challenge-preview', { path: '/courses/:course_id/preview/challenges/:challenge_id' });
  this.route('courses.create-assessment', { path: '/courses/:course_id/assessment' });

  this.route('assessments.get-challenge', { path: '/assessments/:assessment_id/challenges/:challenge_id' });
  this.route('assessments.get-results', { path: '/assessments/:assessment_id/results' });
});

export default Router;
