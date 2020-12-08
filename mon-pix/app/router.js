/* eslint ember/classic-decorator-hooks: 0 */
/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  init() {
    this.on('routeDidChange', () => {
      window.scrollTo(0, 0);
    });
  }
}

/* eslint-disable max-statements */
Router.map(function() {

  this.route('index', { path: '/' });
  this.route('inscription');
  this.route('profile', { path: '/profil' });
  this.route('challenge-preview', { path: '/challenges/:challenge_id/preview' });
  this.route('courses.create-assessment', { path: '/courses/:course_id' });
  this.route('user-account', { path: '/mon-compte' });
  this.route('user-tutorials', { path: '/mes-tutos' });
  this.route('user-dashboard', { path: '/accueil' });

  this.route('assessments', { path: '/assessments/:assessment_id' }, function() {
    this.route('resume');
    this.route('challenge', { path: '/challenges/:challenge_id' });
    this.route('results');
    this.route('checkpoint');
  });

  this.route('login', { path: '/connexion' });
  this.route('logout', { path: '/deconnexion' });
  this.route('not-connected', { path: '/nonconnecte' });
  this.route('reset-password', { path: '/changer-mot-de-passe/:temporary_key' });
  this.route('password-reset-demand', { path: '/mot-de-passe-oublie' });
  this.route('update-expired-password', { path: '/mise-a-jour-mot-de-passe-expire' });

  this.route('certifications', function() {
    this.route('start', { path: '/' });
    this.route('resume', { path: '/:certification_course_id' });
    this.route('results', { path: '/:certification_number/results' });
  });
  this.route('shared-certification', { path: '/partage-certificat/:id' });
  this.route('user-certifications', { path: 'mes-certifications' }, function() {
    this.route('get', { path: '/:id' });
  });
  this.route('fill-in-certificate-verification-code', { path: '/verification-certificat' });

  this.route('fill-in-campaign-code', { path: '/campagnes' });
  this.route('campaigns', { path: '/campagnes/:code' }, function() {
    this.route('start-or-resume', { path: '/' });
    this.route('campaign-landing-page', { path: '/presentation' });
    this.route('fill-in-participant-external-id', { path: '/identifiant' });
    this.route('restricted', { path: '/privee' }, function() {
      this.route('login-or-register-to-access', { path: '/identification' });
      this.route('join', { path: '/rejoindre' });
    });
    this.route('profiles-collection', { path: '/collecte' }, function() {
      this.route('start-or-resume', { path: '/' });
      this.route('send-profile', { path: '/envoi-profil' });
      this.route('profile-already-shared', { path: '/deja-envoye' });
    });
    this.route('assessment', { path: '/evaluation' }, function() {
      this.route('start-or-resume', { path: '/' });
      this.route('tutorial', { path: '/didacticiel' });
      this.route('skill-review', { path: '/resultats/:assessment_id' });
    });
  });

  this.route('competences', { path: '/competences/:competence_id' }, function() {
    this.route('details');
    this.route('results', { path: '/resultats/:assessment_id' });
    this.route('resume', { path: '/evaluer' });
  });

  this.route('terms-of-service', { path: '/cgu' });

  this.route('login-pe', { path: '/connexion-pole-emploi' });

  // XXX: this route is used for any request that did not match any of the previous routes. SHOULD ALWAYS BE THE LAST ONE
  this.route('not-found', { path: '/*path' });
});
