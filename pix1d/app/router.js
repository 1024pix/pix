import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // dans champ de saisie -> id PE de mission (thématique) plutôt que challenge
  this.route('home', { path: '/' });

  // Page de présentation de mission (avec nom et bouton démarrer qui redirige sur /assessment/assessment_id/challenges)
  // Crée l'assessment avec l'id de mission PE
  this.route('mission', { path: '/missions/:mission_id' }, function () {
    this.route('resume');
  });
  this.route('challenge', { path: '/challenges/:challenge_id' });

  this.route('assessment', { path: '/assessments/:assessment_id' }, function () {
    this.route('resume'); // challenge_id est récupéré dans l'adapter du challenge sur une route /next
    this.route('challenge', { path: '/challenges' }); // challenge_id est récupéré dans l'adapter du challenge sur une route /next
  });
});
