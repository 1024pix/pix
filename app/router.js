import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('assessment-create', { path: '/course/:id_course/create_assessment' });

  this.route('challenge-show', { path: '/challenges/:id' });

  /* sketeched routes */
  this.route('home');
  this.route('preferences');
  this.route('challenge-123');
  this.route('challenge-456');
  this.route('challenge-789');
});

export default Router;
