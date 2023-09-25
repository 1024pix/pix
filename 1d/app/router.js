import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);
    this.on('routeDidChange', () => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
      }
      window.scrollTo(0, 0);
    });
  }
}

Router.map(function () {
  this.route('home', { path: '/' });
  this.route('organization', { path: '/organizations/:code' });
  this.route('missions', function () {
    this.route('list', { path: '/' });
    this.route('mission', { path: '/:mission_id' }, function () {
      this.route('resume');
    });
  });

  this.route('challenge-preview', { path: '/challenges/:challenge_id/preview' });

  this.route('assessment', { path: '/assessments/:assessment_id' }, function () {
    this.route('resume');
    this.route('results');
    this.route('challenge', { path: '/challenges' });
  });

  // XXX: this route is used for any request that did not match any of the previous routes. SHOULD ALWAYS BE THE LAST ONE
  this.route('not-found', { path: '/*path' });
});
