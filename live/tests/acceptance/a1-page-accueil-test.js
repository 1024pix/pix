import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a1 - La page d\'accueil', function () {

  let application;

  before(function () {
    application = startApp();
    visit('/');
  });

  after(function () {
    destroyApp(application);
  });

  it('a1.0 est accessible depuis "/"', function () {
    expect(currentURL()).to.equal('/');
  });

  describe('contient une section "Hero"', function () {

    it('a1.0 avec la barre de navigation', function () {
      findWithAssert('.index-page-hero__navbar-header');
    });

    it('a1.1 avec un titre', function () {
      const $title = findWithAssert('.index-page-hero__title');
      expect($title.text().trim()).to.equal('Développez vos compétences numériques');
    });

    it('a1.2 avec un descriptif', function () {
      const $description = findWithAssert('.index-page-hero__description');
      expect($description.text().trim()).to.equal('PIX est un projet public de plateforme en ligne d’évaluation et de certification des compétences numériques, en cours de développement.');
    });
  });

  describe('contient une section "Challenges"', function () {

    it('a1.3 cachée si aucun test n\'est remonté', function () {
      // FIXME find a way to test this correctly
    });

    it('a1.4 visible si au moins 1 test est remonté', function () {
      // FIXME find a way to test this correctly
    });

    it('a1.6 avec un titre', function () {
      const $title = findWithAssert('.index-page-challenges__presentation-title');
      expect($title.text().trim()).to.equal('Le défi Pix de la semaine');
    });

    it('a1.7 avec un texte descriptif', function () {
      const $description = findWithAssert('.index-page-challenges__presentation-text');
      expect($description.text().trim()).to.equal('Chaque semaine, testez vos compétences numériques sur un nouveau sujet.');
    });

    it('a1.8 qui affiche 2 tests maximum', function () {
      // FIXME find a way to test this correctly
    });
  });

  describe('contient une section "Courses"', function () {

    it('a1.9 avec un titre', function () {
      const $title = findWithAssert('.index-page-courses__title');
      expect($title.text().trim()).to.equal('Découvrez nos épreuves et aidez‑nous à les améliorer !');
    });

    it('a1.10 avec la liste des challenges', function () {
      findWithAssert('.index-page-courses__course-list');
    });
  });

  describe('contient une section "Community"', function () {

    it('a1.11 avec un titre', function () {
      findWithAssert('.index-page-community__title');
    });

    it('a1.12 avec une description', function () {
      findWithAssert('.index-page-community__description');
    });

    it('a1.13 avec le formulaire d\'inscription en tant que béta-testeur', function () {
      findWithAssert('.index-page-community__form');
    });

  });

  describe('contient une section "Features"', function () {

    it('a1.14 avec la liste des featurettes', function () {
      findWithAssert('.index-page-features__list');
    });

    it('a1.15 avec un lien vers la page "projet"', function () {
      findWithAssert('.index-page-features__project-button[href="/projet"]');
    });
  });

});
