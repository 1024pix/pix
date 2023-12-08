import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);
    this.on('routeDidChange', (transition) => {
      if (transition.from && transition.to.name !== transition.from.name) {
        window.scrollTo(0, 0);
      }
    });
  }
}

Router.map(function () {
  this.route('login', { path: 'connexion' });

  this.route('join', { path: 'rejoindre' });
  this.route('join-request', { path: '/demande-administration-sco' });
  this.route('join-when-authenticated');

  this.route('terms-of-service', { path: '/cgu' });

  this.route('authenticated', { path: '' }, function () {
    this.route('sco-organization-participants', { path: 'eleves' }, function () {
      this.route('list', { path: '/' });
      this.route('sco-organization-participant', { path: '/:eleve_id' }, function () {
        this.route('activity', { path: '/' });
      });
    });
    this.route('organization-participants', { path: 'participants' }, function () {
      this.route('list', { path: '/' });
      this.route('organization-participant', { path: '/:participant_id' }, function () {
        this.route('activity', { path: '/' });
      });
    });
    this.route('sup-organization-participants', { path: 'etudiants' }, function () {
      this.route('list', { path: '/' });
      this.route('import');
      this.route('sup-organization-participant', { path: '/:etudiant_id' }, function () {
        this.route('activity', { path: '/' });
      });
    });
    this.route('team', { path: '/equipe' }, function () {
      this.route('list', { path: '/' }, function () {
        this.route('members', { path: '/membres' });
        this.route('invitations');
      });
      this.route('new', { path: '/creation' });
    });
    this.route('campaigns', { path: '/campagnes' }, function () {
      this.route('list', { path: '/' }, function () {
        this.route('my-campaigns', { path: '/les-miennes' });
        this.route('all-campaigns', { path: '/toutes' });
      });
      this.route('new', { path: '/creation' });
      this.route('update', { path: '/:campaign_id/modification' });
      this.route(
        'participant-assessment',
        { path: '/:campaign_id/evaluations/:campaign_participation_id' },
        function () {
          this.route('results', { path: '/resultats' });
          this.route('analysis', { path: '/analyse' });
        },
      );
      this.route('participant-profile', { path: '/:campaign_id/profils/:campaign_participation_id' });
      this.route('campaign', { path: '/:campaign_id' }, function () {
        this.route('activity', { path: '/' });
        this.route('assessment-results', { path: '/resultats-evaluation' });
        this.route('profile-results', { path: '/profils' });
        this.route('analysis', { path: '/analyse' });
        this.route('settings', { path: '/parametres' });
      });
    });
    this.route('certifications');
    this.route('preselect-target-profile', { path: '/selection-sujets' });
    this.route('places');
  });

  this.route('logout');

  this.route('not-found', { path: '/*path' });
});
