import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 176 - Affichage du bandeau d\'une épreuve |', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Dans le cadre de la vue "passage d\'une épreuve"', function () {

    before(function () {
      visit('/assessments/new_assessment_id/challenges/qcm_challenge_id');
    });

    it('Le nom du test est affiché', function() {
      expect(findWithAssert('.course-banner-name').text()).to.contains('Name of the course');
    });

    it('Il existe un bouton "Revenir à la liste des tests"', function () {
      const $courseListButton = findWithAssert('.course-banner-home-link');
      expect($courseListButton.text()).to.equal('Retour à la liste des tests');
    });

    it('Quand je clique sur le bouton "Revenir à la liste des tests", je suis redirigé vers l\'index', function () {
      // when
      click('.course-banner-home-link');

      // then...
      andThen(() => expect(currentURL()).to.equal('/'));
    });
  });

  describe('Dans le cadre de la vue "résultat d\'une évaluation"', function () {

    before(function () {
      visit('/assessments/completed_assessment_id/results');
    });

    it('Le nom du test est affiché', function() {
      expect(findWithAssert('.course-banner-name').text()).to.contains('Name of the course');
    });

    it('Le bouton "Revenir à la liste des tests" n\'apparaît pas', function () {
      expect(find('.course-banner-home-link')).to.have.lengthOf(0);
    });
  });

});
