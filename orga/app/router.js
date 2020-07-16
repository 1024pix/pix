import EmberRouter from '@ember/routing/router';
import config from './config/environment';

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

Router.map(function() {
  this.route('login', { path: 'connexion' });

  this.route('join', { path: 'rejoindre' });
  this.route('join-request', { path: '/demande-administration-sco' });
  this.route('join-when-authenticated');

  this.route('terms-of-service', { path: '/cgu' });

  this.route('authenticated', { path: '' }, function() {
    this.route('sco-students', { path: 'eleves' }, function() {
      this.route('list', { path: '/' });
    });
    this.route('sup-students', { path: 'etudiants' }, function() {
      this.route('list', { path: '/' });
    });
    this.route('team', { path: '/equipe' }, function() {
      this.route('list', { path: '/' });
      this.route('new', { path: '/creation' });
    });
    this.route('campaigns', { path: '/campagnes' }, function() {
      this.route('list', { path: '/' });
      this.route('new', { path: '/creation' });
      this.route('update', { path: '/:campaign_id/modification' });
      this.route('participant', { path: '/:campaign_id/participants/:campaign_participation_id' }, function() {
        this.route('results', { path: '/resultats' });
        this.route('analysis', { path: '/analyse' });
      });
      this.route('profile', { path: '/:campaign_id/profils/:campaign_participation_id' });
      this.route('details', { path: '/:campaign_id' }, function() {
        this.route('parameters', { path: '/' });
        this.route('collective-results', { path: '/resultats-collectifs' });
        this.route('analysis', { path: '/analyse' });
        this.route('participants');
        this.route('profiles', { path: '/profils' });
      });
    });
  });

  this.route('logout');

  if (config.environment !== 'production') {
    this.route('style-guide', { path: 'guide-de-style' });
  }

  this.route('not-found', { path: '/*path' });
});
