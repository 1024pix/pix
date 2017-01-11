import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | b7 - Points communs a toutes les épreuves | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
  });

  it('b7.0 Le nom du test est affiché', function() {
    expect(findWithAssert('.course-banner-name').text()).to.contains('First Course');
  });

  it('b7.1 L\'instruction de l\'epreuve est affichée', function () {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructiontext = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
    expect($challengeInstruction.text()).to.equal(instructiontext);
  });

  it('b7.2a Le contenu de type [foo](bar) doit être converti sous forme de lien', function() {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('ouverte');
    expect($links.attr('href')).to.equal('http://link.ouverte.url');
  });

  it('b7.2b Les liens doivent s\'ouvrir dans un nouvel onglet', function() {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('b7.3 Un bouton de type "Skip" doit s\'afficher', function () {
    expect($('.challenge-actions__action-skip')).to.have.lengthOf(1);
  });

  it('b7.4 Un bouton de type "Validate" doit s\'afficher', function () {
    expect($('.challenge-actions__action-skip')).to.have.lengthOf(1);
  });

  it('b7.5 Il existe un bouton "Revenir à la liste des tests"', function () {
    const $courseListButton = findWithAssert('.course-banner-home-link');
    expect($courseListButton.text()).to.equal('Retour à la liste des tests');
  });

  it('b7.6 Quand je clique sur le bouton "Revenir à la liste des tests", je suis redirigé vers l\'index', function () {
    // when
    click('.course-banner-home-link');

    // then
    andThen(() => expect(currentURL()).to.equal('/'));
  });
});
