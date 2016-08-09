import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance: 4-DemarrerEpreuve', function() {
  let application;
  let assessment;
  let challenge;

  before(function() {
    application = startApp();
    assessment = server.create('assessment');
    challenge = assessment.challenges.models[0];
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/challenges/${challenge.id}`);
  });

  /* US4 CA:
    1. La zone de consigne s'affiche (texte simple)
    2. La zone de réponse s'affiche
    3. L'intitulé du test est rappelé
    4. L'état d'avancement dans le test est visible (# épreuve / # total d'épreuves)
    5. Deux boutons s'affichent : "Passer" ; "Valider" (UX: attention à l'affordance, passer ne valide pas les réponses)
  */

  it('4.0 doit être sur l\'URL /challenges/:id', function () {
    expect(currentURL()).to.equal(`/challenges/${challenge.id}`);
  });

  it('4.1 affiche la zone de consigne', function() {
    expect(find('.zone-de-consigne').text()).to.contains(challenge.attrs.instruction);
  });

  it('4.2 affiche la zone de réponse', function() {
    expect(find('.zone-de-reponse').text()).to.contains('Réponse');
  });

  it('4.3 rappelle l\'intitulé du test', function() {
    expect(find('.intitule-de-test').text()).to.contains(assessment.course.attrs.name);
  });

  it("4.4 affiche l'état d'avancement du test", function() {
    expect(find('.avancement-du-test').text()).to.contains(`Épreuve 1 / ${assessment.challenges.models.length}`);
  });

  it("4.5 affiche les deux boutons Passer et Valider", function() {
    expect(find('.action-skip').text()).to.eq('Passer');
    expect(find('.action-validate').text()).to.eq('Valider');
  });
});
