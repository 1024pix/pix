import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a1 - La page d\'accueil', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('a1.0 Accessing to "/"', function() {
    expect(currentURL()).to.equal('/');
  });

  describe('contains an "Hero" section', function() {

    it('a1.0 with a navbar', function() {
      findWithAssert('.index-page-hero__navbar-header');
    });

    it('a1.1 with a title', function() {
      const $title = findWithAssert('.index-page-hero__title');
      expect($title.text().trim()).to.equal('Développez vos compétences numériques');
    });

    it('a1.2 with a description', function() {
      const $description = findWithAssert('.index-page-hero__description');
      expect($description.text().trim()).to.equal('PIX est un projet public de plateforme en ligne d’évaluation et de certification des compétences numériques, en cours de développement.');
    });
  });

  describe('contains a "Challenges section"', function() {

    it('a1.3 hided when no test', function() {
      // FIXME find a way to test this correctly
    });

    it('a1.4 displayed when at least one test', function() {
      // FIXME find a way to test this correctly
    });

    it('a1.6 with a title', function() {
      const $title = findWithAssert('.index-page-challenges__presentation-title');
      expect($title.text().trim()).to.equal('Les défis Pix de la semaine');
    });

    it('a1.7 with a description', function() {
      const $description = findWithAssert('.index-page-challenges__presentation-text');
      expect($description.text().trim()).to.equal('Chaque semaine, testez vos compétences numériques sur un nouveau sujet.');
    });

    it('a1.8 display only two tests', function() {
      // FIXME find a way to test this correctly
    });
  });

  describe('contains a section with a bbutton to save new partners', function() {

    it('a1.16 with a title', function() {
      const $title = findWithAssert('.partners-enrollment__title');
      expect($title.text().trim()).to.equal('Collèges, lycées, établissements d’enseignement supérieur : rejoignez l’aventure Pix dès l’année 2017-2018 !');
    });

    it('a1.17 with a description', function() {
      const $title = findWithAssert('.partners-enrollment__description');
      expect($title.text().trim()).to.equal('Je veux que mon établissement propose la certification Pix dès cette année');
    });

    it('a1.17 with a link to registering page', function() {
      const $title = findWithAssert('.partners-enrollment__link');
      findWithAssert('.partners-enrollment__link-container');
      expect($title.attr('href').trim()).to.equal('/rejoindre');
    });
  });

  describe('contains a "Courses" section', function() {

    it('a1.9 with a title', function() {
      const $title = findWithAssert('.index-page-courses__title');
      expect($title.text().trim()).to.equal('Découvrez nos épreuves et aidez‑nous à les améliorer !');
    });

    it('a1.10 with a challenges list', function() {
      findWithAssert('.index-page-courses__course-list');
    });
  });

  describe('contains a "Community" section', function() {

    it('a1.11 with a title', function() {
      findWithAssert('.index-page-community__title');
    });

    it('a1.12 with a description', function() {
      findWithAssert('.index-page-community__description');
    });

    it('a1.13 with a form subscription to beta tester', function() {
      findWithAssert('.index-page-community__form');
    });

  });

  describe('contains a "Features" section', function() {

    it('a1.14 with a feature list', function() {
      findWithAssert('.index-page-features__list');
    });

    it('a1.15 with a link to "projet"', function() {
      findWithAssert('.index-page-features__project-button[href="/projet"]');
    });
  });

});
