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

Router.map(function () {
  this.route('authenticated', { path: '/' }, function () {
    this.route('index', { path: '' });
    this.route('attestations', { path: '/mes-attestations' });
    this.route('user-dashboard', { path: '/accueil' });
    this.route('profile', { path: '/competences' });
    this.route('user-tests', { path: '/mes-parcours' });
    this.route('sitemap', { path: '/plan-du-site' });

    this.route('user-trainings', { path: '/mes-formations' });

    this.route('user-tutorials', { path: '/mes-tutos' }, function () {
      this.route('recommended', { path: '/recommandes' });
      this.route('saved', { path: '/enregistres' });
    });

    this.route('user-account', { path: '/mon-compte' }, function () {
      this.route('personal-information', { path: '/informations-personnelles' });
      this.route('connection-methods', { path: '/methodes-de-connexion' });
      this.route('language', { path: '/langue' });
      this.route('delete-account');
    });

    this.route('certifications', function () {
      this.route('join', { path: '/' });
      this.route('information', { path: '/candidat/:certification_candidate_id/informations' });
      this.route('start', { path: '/candidat/:certification_candidate_id' });
      this.route('resume', { path: '/:certification_course_id' });
      this.route('results', { path: '/:certification_id/results' });
    });

    this.route('user-certifications', { path: 'mes-certifications' }, function () {
      this.route('get', { path: '/:id' });
    });

    this.route('competences', { path: '/competences/:competence_id' }, function () {
      this.route('details');
      this.route('results', { path: '/resultats/:assessment_id' });
      this.route('resume', { path: '/evaluer' });
    });
  });

  this.route('challenge-preview', { path: '/challenges/:challenge_id/preview' });
  this.route('llm.preview', { path: '/llm/preview/:chat_id' });
  this.route('courses.start', { path: '/courses/:course_id' });

  this.route('assessments', { path: '/assessments/:assessment_id' }, function () {
    this.route('resume');
    this.route('challenge', { path: '/challenges/:challenge_number' });
    this.route('results');
    this.route('checkpoint');
  });

  this.route('shared-certification', { path: '/partage-certificat/:id' });

  this.route('fill-in-certificate-verification-code', { path: '/verification-certificat' });
  this.route('fill-in-campaign-code', { path: '/campagnes' });
  this.route('organizations', { path: '/organisations/:code' }, function () {
    this.route('access', { path: '/acces' });
    this.route('invited', { path: '/prescrit' }, function () {
      this.route('reconciliation', { path: '/enregistrement' });
      this.route('student-sco', { path: '/eleve' });
      this.route('student-sup', { path: '/etudiant' });
    });
    this.route('join', { path: '/rejoindre' }, function () {
      this.route('anonymous', { path: '/anonyme' });
      this.route('student-sco', { path: '/identification' });
      this.route('sco-mediacentre', { path: '/mediacentre' });
    });
  });
  this.route('campaigns', { path: '/campagnes/:code' }, function () {
    this.route('entry-point', { path: '/' });
    this.route('archived-error', { path: '/oups' });
    this.route('campaign-landing-page', { path: '/presentation' });
    this.route('fill-in-participant-external-id', { path: '/identifiant' });
    this.route('entrance', { path: '/entree' });
    this.route('profiles-collection', { path: '/collecte' }, function () {
      this.route('start-or-resume', { path: '/' });
      this.route('send-profile', { path: '/envoi-profil' });
      this.route('profile-already-shared', { path: '/deja-envoye' });
    });
    this.route('assessment', { path: '/evaluation' }, function () {
      this.route('start-or-resume', { path: '/' });
      this.route('tutorial', { path: '/didacticiel' });
      this.route('results', { path: '/resultats' });
    });
    this.route('existing-participation', { path: '/participation-existante' });
  });
  this.route('combined-courses', { path: '/parcours/:code' });

  this.route('module-preview-existing', { path: '/modules/preview/:slug' });
  this.route('module-preview', { path: '/modules/preview' });
  this.route('module', { path: '/modules/:slug' }, function () {
    this.route('details');
    this.route('passage');
    this.route('recap');
  });

  this.route('terms-of-service', { path: '/cgu' });

  this.route('inscription', function () {
    this.route('signup', { path: '' });
    this.route('sso-selection');
  });

  this.route('authentication', { path: '/connexion' }, function () {
    this.route('login', { path: '' });
    this.route('login-oidc', { path: '/:identity_provider_slug' });
    this.route('oidc-signup-or-login', { path: '/oidc' });
    this.route('login-gar', { path: '/gar' });
    this.route('sso-selection');
  });

  this.route('logout', { path: '/deconnexion' });
  this.route('not-connected', { path: '/nonconnecte' });

  this.route('reset-password', { path: '/changer-mot-de-passe/:temporary_key' });
  this.route('password-reset-demand', { path: '/mot-de-passe-oublie' });
  this.route('update-expired-password', { path: '/mise-a-jour-mot-de-passe-expire' });

  this.route('account-recovery', { path: '/recuperer-mon-compte' }, function () {
    this.route('find-sco-record', { path: '/' });
    this.route('update-sco-record', { path: '/:temporary_key' });
  });

  this.route('companion', { path: '/verification-extension-certification' });

  this.route('download-session-results', { path: '/resultats-session' });

  // XXX: this route is used for any request that did not match any of the previous routes. SHOULD ALWAYS BE THE LAST ONE
  this.route('not-found', { path: '/*path' });
});
