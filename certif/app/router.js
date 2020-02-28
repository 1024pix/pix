import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  init() {
    this._super(...arguments);
    this.on('routeDidChange', () => {
      window.scrollTo(0, 0);
    });
  },

});

Router.map(function() {
  this.route('login', { path: 'connexion' });

  this.route('terms-of-service', { path: '/cgu' });
  this.route('authenticated', { path: '' }, function() {
    this.route('sessions', function() {
      this.route('list', { path: '/liste' });
      this.route('new', { path: '/creation' });
      this.route('update', { path: '/:session_id/modification' });
      this.route('finalize', { path: '/:session_id/finalisation' });
      this.route('details', { path: '/:session_id' }, function() {
        this.route('parameters', { path: '/' });
        this.route('certification-candidates', { path: '/candidats' });
      });
    });
  });

  this.route('logout');

  this.route('not-found', { path: '/*path' });
});

export default Router;
