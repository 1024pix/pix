import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 10 - Consulter l'écran de fin d'un test ", function() {

  let application;
  let assessment;
  let course;
  let $assessmentResults;

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/completed_assessment_id/results`);
  });

  before(function () {
    $assessmentResults = findWithAssert('#assessment-results');
  });


  it("10.1. se fait en accédant à l'URL /assessments/:assessment_id/results", function () {
    expect(currentURL()).to.equal(`/assessments/completed_assessment_id/results`);
  });

  it("10.2. affiche un titre", function () {
    expect($assessmentResults.text()).to.contains('Mercix !');
  });

  it("10.3. affiche un texte explicatif", function () {
    const expectedText = "Un PixMaster va étudier vos réponses et échanger avec vous pour recueillir vos impressions.";
    expect($assessmentResults.text()).to.contains(expectedText);
  });

  it("10.4. affiche l'intitulé du test", function () {
    expect($assessmentResults.text()).to.contains("Name of the course");
  });

  it("10.5. affiche le rapport nombre de réponses saisies sur nombre d'épreuves du test", function () {
    const expectedString = `3 question(s) sur 3`;
    expect($assessmentResults.text()).to.contains(expectedString);
  });

  it("11.1. propose un moyen pour revenir à la liste des tests", function () {
    const $homeLink = findWithAssert('.home-link');
    expect($homeLink.attr('href')).to.equal('/home');
  });

});
