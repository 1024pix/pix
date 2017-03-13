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

  describe('une section "Challenges"', function () {

    it('a1.3 avec un titre', function () {
      const $title = findWithAssert('.index-page-challenges__title');
      expect($title.text().trim()).to.equal('Découvrez nos épreuves et aidez‑nous à les améliorer !');
    });

    it('a1.4 avec la liste des challenges', function () {
      findWithAssert('.index-page-challenges__list');
    });
  });

  describe('une section "Community"', function () {

    it('a1.5 avec un titre', function () {
      findWithAssert('.index-page-community__title');
    });

    it('a1.6 avec une description', function () {
      findWithAssert('.index-page-community__description');
    });

    it('a1.7 avec le formulaire d\'inscription en tant que béta-testeur', function () {
      findWithAssert('.index-page-community__form');
    });

  });

  describe('une section "Features"', function () {

    it('a1.8 avec la liste des featurettes', function () {
      findWithAssert('.index-page-features__list');
    });

    it('a1.9 avec un lien vers la page "projet"', function () {
      findWithAssert('.index-page-features__project-button[href="/projet"]');
    });
  });

});
