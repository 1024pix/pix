import EmberRouter from '@ember/routing/router';
import config from 'pix-certif/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);
    this.on('routeDidChange', () => {
      window.scrollTo(0, 0);
    });
  }
}

Router.map(function () {
  this.route('login', { path: 'connexion' });

  this.route('join', { path: 'rejoindre' });

  this.route('terms-of-service', { path: '/cgu' });
  this.route('login-session-supervisor', { path: '/connexion-espace-surveillant' });
  this.route('session-supervising', { path: '/sessions/:session_id/surveiller' });
  this.route('authenticated', { path: '' }, function () {
    this.route('restricted-access', { path: '/espace-ferme' });
    this.route('sessions', function () {
      this.route('list', { path: '/liste' });
      this.route('new', { path: '/creation' });
      this.route('import');
      this.route('update', { path: '/:session_id/modification' });
      this.route('finalize', { path: '/:session_id/finalisation' });
      this.route('details', { path: '/:session_id' }, function () {
        this.route('parameters', { path: '/' });
        this.route('certification-candidates', { path: '/candidats' });
      });
      this.route('add-student', { path: '/:session_id/inscription-eleves' });
    });
    this.route('team', { path: '/equipe' });
  });

  this.route('logout');

  this.route('not-found', { path: '/*path' });
});
