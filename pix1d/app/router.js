import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('home', { path: '/' });
  this.route('mission', { path: '/missions/:mission_id' }, function () {
    this.route('resume');
  });
  // route à activer pour les previews
  // this.route('challenge', { path: '/challenges/:challenge_id' });

  this.route('assessment', { path: '/assessments/:assessment_id' }, function () {
    this.route('resume');
    this.route('results');
    this.route('challenge', { path: '/challenges' });
  });
});
