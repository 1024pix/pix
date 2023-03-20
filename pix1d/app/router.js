import EmberRouter from '@ember/routing/router';
import config from 'pix1d/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('challenge', { path: '/challenges/:challenge_number' });
});
