import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';

import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | c1 - Consulter l\'écran de fin d\'un test ', function() {

  let application;

  before(function() {
    application = startApp();
    visit('/assessments/ref_assessment_id/results');
  });

  after(function() {
    destroyApp(application);
  });

  it('c1.0 se fait en accédant à l\'URL /assessments/:assessment_id/results', function() {
    expect(currentURL()).to.equal('/assessments/ref_assessment_id/results');
  });

  it('c1.1 affiche une liste qui récapitule les réponses', function() {
    findWithAssert('.assessment-results__list');
  });

  it('c1.2 le tableau récapitulatif contient les instructions ', function() {
    const $proposals = findWithAssert('.result-item');
    expect($proposals.text()).to.contains('Un QCM propose plusieurs choix');
    expect($proposals.text()).to.contains('Un QCU propose plusieurs choix');
    expect($proposals.text()).to.contains('Un QROC est une question ouverte');
    expect($proposals.text()).to.contains('Un QROCM est une question ouverte');
  });

  it('c1.3 Pour une mauvaise réponse, le tableau récapitulatif donne une indication adéquate', function() {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(0)');
    expect($cell.attr('data-original-title')).to.equal('Réponse incorrecte');
  });

  it('c1.9 Le nom du test est affiché', function() {
    expect(findWithAssert('.course-banner__name').text()).to.contains('First Course');
  });

  it('c1.10 Le bouton "Revenir à la liste des tests" n\'apparaît pas', function() {
    expect(find('.course-banner__home-link')).to.have.lengthOf(0);
  });

  it('c1.11. propose un moyen pour revenir à la liste des tests', function() {
    findWithAssert('.assessment-results__index-link-container');
  });

  it('c1.12. La bannière est affichée', function() {
    findWithAssert('.assessment-results__course-banner');
  });

});
