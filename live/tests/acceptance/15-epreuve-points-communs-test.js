import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 15 - Points communs a toutes les épreuves | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/assessments/first_assessment_id/challenges/ref_qrocm_challenge_id`);
  });

  it('15.0 Le nom du test est affiché', function() {
    expect(findWithAssert('.course-banner-name').text()).to.contains('First Course');
  });

  it('15.1 L\'instruction de l\'epreuve est affichée', function () {
    expect($('.challenge-instruction').text()).to.equal('Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre');
  });

  it("15.2a Le contenu de type [foo](bar) doit être converti sous forme de lien", function() {
    let $links = findWithAssert('.challenge-instruction a');
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('ouverte');
    expect($links.attr('href')).to.equal('http://link.ouverte.url');
  });

  it("15.2b Les liens doivent s'ouvrir dans un nouvel onglet", function() {
    let $links = findWithAssert('.challenge-instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('15.3 Un bouton de type "Skip" doit s\'afficher', function () {
    expect($('.challenge-item-actions__skip-action')).to.have.lengthOf(1);
  });

  it('15.4 Un bouton de type "Validate" doit s\'afficher', function () {
    expect($('a.challenge-item-actions__validate-action')).to.have.lengthOf(1);
  });

  it('15.5 Il existe un bouton "Revenir à la liste des tests"', function () {
    const $courseListButton = findWithAssert('.course-banner-home-link');
    expect($courseListButton.text()).to.equal('Retour à la liste des tests');
  });

  it('15.6 Quand je clique sur le bouton "Revenir à la liste des tests", je suis redirigé vers l\'index', function () {
    // when
    click('.course-banner-home-link');

    // then...
    andThen(() => expect(currentURL()).to.equal('/'));
  });
});
