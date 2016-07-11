import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('about');
  this.route('contact');
  this.route('assessments');
  this.route('assessment', { path: 'assessments/:assessment_id' });
});

export default Router;
