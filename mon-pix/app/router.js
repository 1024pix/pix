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

/* eslint-disable max-statements */
export default Router.map(function() {
  this.route('index', { path: '/' });
  this.route('inscription');
  this.route('profile', { path: '/profil' });
  this.route('challenge-preview', { path: '/challenges/:challenge_id/preview' });
  this.route('courses.create-assessment', { path: '/courses/:course_id' });

  this.route('assessments', { path: '/assessments/:assessment_id' }, function() {
    this.route('resume', { path: '/resume' });
    this.route('challenge', { path: '/challenges/:challenge_id' });
    this.route('results', { path: '/results' });
    this.route('checkpoint', { path: '/checkpoint' });
  });

  this.route('login', { path: '/connexion' });
  this.route('logout', { path: '/deconnexion' });
  this.route('not-connected', { path: '/nonconnecte' });
  this.route('board');
  this.route('reset-password', { path: '/changer-mot-de-passe/:temporary_key' });
  this.route('password-reset-demand', { path: '/mot-de-passe-oublie' });
  this.route('certifications', function() {
    this.route('start', { path: '/' });
    this.route('resume', { path: '/:certification_course_id' });
    this.route('results', { path: '/:certification_number/results' });
  });

  this.route('user-certifications', { path: 'mes-certifications' }, function() {
    this.route('get', { path: '/:id' });
  });

  this.route('campaigns', { path: '/campagnes' }, function() {
    this.route('fill-in-campaign-code', { path: '/' });
    this.route('start-or-resume', { path: '/:campaign_code' });
    this.route('campaign-landing-page', { path: '/:campaign_code/presentation' });
    this.route('fill-in-id-pix', { path: '/:campaign_code/identifiant' });
    this.route('tutorial', { path: '/:campaign_code/didacticiel' });
    this.route('skill-review', { path: '/:campaign_code/resultats/:assessment_id' });
  });

  this.route('competence-details', { path: '/competences/:scorecard_id' });
  this.route('competences', { path: '/competences' }, function() {
    this.route('resume', { path: '/:competence_id/evaluer' });
    this.route('results', { path: '/resultats/:assessment_id' });
  });

  // XXX: this route is used for any request that did not match any of the previous routes. SHOULD ALWAYS BE THE LAST ONE
  this.route('not-found', { path: '/*path' });
});
