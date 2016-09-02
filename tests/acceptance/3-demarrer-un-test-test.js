import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 3 - Démarrer un test |', function () {

  let application;
  let course;
  let challenge;
  let assessment;

  before(function () {
    application = startApp();
    challenge = server.create('challenge-airtable');
    course = server.create('course-airtable');
    course.attachOne('Épreuves', challenge);
    assessment = server.create('assessment-airtable');
    assessment.attachOne('Test', course);
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit('/home');
  });

  it('3.1. Je peux démarrer un test depuis la liste des tests de la page d\'accueil', function() {
    const $startLink = findWithAssert('.start-button')[0];
    expect($startLink.text).to.contains('Démarrer le test');
    expect($startLink.href).to.contains(`/courses/${course.attrs.id}/assessment`);
  });

  it('3.2. Quand je démarre un test, je suis redirigé vers la première épreuve du test', function() {
    const $startLink = findWithAssert('.start-button')[0];
    return click($startLink).then(function() {
      findWithAssert('#assessment-challenge');
      expect(currentURL()).to.contains(`/assessments/${assessment.attrs.id}/challenges/${challenge.attrs.id}`);
    });
  });

});
