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

  describe('the "Courses" section', function() {

    it('should have a title', function() {
      const $title = findWithAssert('.index-page-courses__title');
      expect($title.text().trim()).to.equal('Découvrez nos épreuves et aidez‑nous à les améliorer !');
    });

    it('should have a list of challenge', function() {
      findWithAssert('.index-page-courses__course-list');
    });
  });

  describe('the "Features" section', function() {

    it('should contain a list of features', function() {
      findWithAssert('.index-page-features__list');
    });

  });
});
