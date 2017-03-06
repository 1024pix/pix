import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | c1 - Consulter l\'écran de fin d\'un test ', function() {

  let application;

  beforeEach(function () {
    application = startApp();
    visit('/assessments/ref_assessment_id/results');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('c1.0 se fait en accédant à l\'URL /assessments/:assessment_id/results', function () {
    expect(currentURL()).to.equal('/assessments/ref_assessment_id/results');
  });

  it('c1.1 affiche une liste qui récapitule les réponses', function () {
    findWithAssert('.assessment-results__list');
  });

  it('c1.2 le tableau récapitulatif contient les instructions ', function () {
    const $proposals = findWithAssert('.result-list__item');
    expect($proposals.text()).to.contains('Un QCM propose plusieurs choix');
    expect($proposals.text()).to.contains('Un QCU propose plusieurs choix');
    expect($proposals.text()).to.contains('Un QROC est une question ouverte');
    expect($proposals.text()).to.contains('Un QROCM est une question ouverte');
  });


  it('c1.3 Pour une bonne réponse, le tableau récapitulatif donne une indication adéquate', function () {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(0)');
    expect($cell.attr('data-original-title')).to.equal('Réponse incorrecte');
  });

  it.skip('c1.4 Pour une mauvaise réponse, le tableau récapitulatif donne une indication adéquate', function () {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(1)');
    expect($cell.attr('data-original-title')).to.equal('Réponse correcte');
  });

  it.skip('c1.5 Pour une réponse dont la validation n\'est pas encore implémentée, le tableau récapitulatif donne une indication adéquate', function () {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(3)');
    expect($cell.attr('data-original-title')).to.equal('Correction automatique en cours de développement ;)');
  });

  it.skip('c1.6 Pour une réponse dont l\'utilisateur a cliqué sur \'Je Passe\', le tableau récapitulatif donne une indication adéquate', function () {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(2)');
    expect($cell.attr('data-original-title')).to.equal('Sans réponse');
  });

  it.skip('c1.7 Pour une réponse dont l\'utilisateur n\'a qu\'une partie des bonnes réponse, le tableau récapitulatif donne une indication adéquate', function () {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(4)');
    expect($cell.attr('data-original-title')).to.equal('Réponse partielle');
  });

  it.skip('c1.8 Pour une réponse dont l\'utilisateur a bien répondu mais trop tard, le tableau récapitulatif donne une indication adéquate', function () {
    visit('/assessments/raw_assessment_id/results');
    andThen(() => {
      const $picto = findWithAssert('.assessment-results-result-img > div');
      expect($picto.data('original-title')).to.contain('Temps dépassé');
    });
  });


  it('c1.9 Le nom du test est affiché', function() {
    expect(findWithAssert('.course-banner-name').text()).to.contains('First Course');
  });

  it('c1.10 Le bouton "Revenir à la liste des tests" n\'apparaît pas', function () {
    expect(find('.course-banner-home-link')).to.have.lengthOf(0);
  });

  it('c1.11. propose un moyen pour revenir à la liste des tests', function () {
    findWithAssert('.assessment-results__index-link-container');
  });

  it('c1.12. La bannière est affichée', function () {
    findWithAssert('.assessment-results__course-banner');
  });

});
