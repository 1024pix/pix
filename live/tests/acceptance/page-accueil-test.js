import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | La page d\'accueil', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should be accessible from "/"', function() {
    expect(currentURL()).to.equal('/');
  });

  describe('the "Hero" section', function() {

    it('should have a navigation bar', function() {
      findWithAssert('.index-page-hero__navbar-header');
    });

    it('should have a title', function() {
      const $title = findWithAssert('.index-page-hero__title');
      expect($title.text().trim()).to.equal('Développez vos compétences numériques');
    });

    it('should have a description', function() {
      const $description = findWithAssert('.index-page-hero__description');
      expect($description.text().trim()).to.equal('PIX est un projet public de plateforme en ligne d’évaluation et de certification des compétences numériques, en cours de développement.');
    });
  });

  describe('contains a section with a button to save new partners', function() {

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

  describe('the "Courses" section', function() {

    it('should have a title', function() {
      const $title = findWithAssert('.index-page-courses__title');
      expect($title.text().trim()).to.equal('Découvrez nos épreuves et aidez‑nous à les améliorer !');
    });

    it('should have a list of challenge', function() {
      findWithAssert('.index-page-courses__course-list');
    });
  });

  describe('The "Community" section', function() {

    it('should have a title', function() {
      findWithAssert('.index-page-community__title');
    });

    it('should have a description', function() {
      findWithAssert('.index-page-community__description');
    });

    it('should a "beta" user inscription form', function() {
      findWithAssert('.index-page-community__form');
    });

  });

  describe('the "Features" section', function() {

    it('should contain a list of features', function() {
      findWithAssert('.index-page-features__list');
    });

    it('should have a link to the "projet" page', function() {
      findWithAssert('.index-page-features__project-button[href="/projet"]');
    });
  });
});
