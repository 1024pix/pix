import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 08 - Consulter l'écran de fin d'un test ", function() {

  let application;

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/first_assessment_id/results`);
  });


  it("08.0 se fait en accédant à l'URL /assessments/:assessment_id/results", function () {
    expect(currentURL()).to.equal(`/assessments/first_assessment_id/results`);
  });

  it("08.1 affiche une liste qui récapitule les réponses", function () {
    findWithAssert('.assessment-results-list');
  });

  it("08.2 le tableau récapitulatif contient les instructions ", function () {
    const $proposals = findWithAssert('.assessment-results-result');
    expect($proposals.text()).to.contains('Un QCM propose plusieurs choix');
    expect($proposals.text()).to.contains('Un QCU propose plusieurs choix');
    expect($proposals.text()).to.contains('Un QROC est une question ouverte');
    expect($proposals.text()).to.contains('Un QROCM est une question ouverte');
  });


  it("08.3 Pour une bonne réponse, le tableau récapitulatif donne une indication adéquate", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(0)');
    expect($cell.attr('data-original-title')).to.equal('Réponse correcte');
  });

  it("08.4 Pour une mauvaise réponse, le tableau récapitulatif donne une indication adéquate", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(1)');
    expect($cell.attr('data-original-title')).to.equal('Réponse incorrecte');
  });

  it("08.5 Pour une réponse en cours de validation, le tableau récapitulatif donne une indication adéquate", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(2)');
    expect($cell.attr('data-original-title')).to.equal('Vérification en cours');
  });

  it("08.6 Pour une réponse dont l\'utilisateur a cliqué sur \"Je Passe\", le tableau récapitulatif donne une indication adéquate", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(3)');
    expect($cell.attr('data-original-title')).to.equal('Sans réponse');
  });

  it('08.7 Le nom du test est affiché', function() {
    expect(findWithAssert('.course-banner-name').text()).to.contains('First Course');
  });

  it('08.8 Le bouton "Revenir à la liste des tests" n\'apparaît pas', function () {
    expect(find('.course-banner-home-link')).to.have.lengthOf(0);
  });

  it("08.9. propose un moyen pour revenir à la liste des tests", function () {
    const $homeLink = findWithAssert('button.assessment-results-link-home');
  });


});
