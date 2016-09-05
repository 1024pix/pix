import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import Ember from 'ember';

describe("Acceptance | 10 - Consulter l'écran de fin d'un test ", function() {

  let application;
  let assessment;
  let course;
  let challenges;
  let answers;
  let $assessmentResults;

  before(function() {
    application = startApp();

    assessment = server.create('assessment-airtable');
    course = server.create('course-airtable');
    challenges = server.createList('challenge-airtable', 5);
    answers = server.createList('answer-airtable', 5);

    assessment.attachOne('Test', course);
    course.attachMany('Épreuves', challenges);
    for (let i = 0 ; i < answers.length ; i++) {
      const answer = answers[i];
      const challenge = challenges[i];
      answer.attachOne('Evaluation', assessment);
      answer.attachOne('Epreuve', challenge);
    }
    assessment.attachMany('Reponses', answers);
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/${assessment.attrs.id}/results`);
  });

  before(function () {
    $assessmentResults = findWithAssert('#assessment-results');
  });


  it("10.1. se fait en accédant à l'URL /assessments/:assessment_id/results", function () {
    expect(currentURL()).to.equal(`/assessments/${assessment.attrs.id}/results`);
  });

  it("10.2. affiche un titre", function () {
    expect($assessmentResults.text()).to.contains('Mercix !');
  });

  it("10.3. affiche un texte explicatif", function () {
    const expectedText = "Un PixMaster va étudier vos réponses et échanger avec vous pour recueillir vos impressions.";
    expect($assessmentResults.text()).to.contains(expectedText);
  });

  it("10.4. affiche l'intitulé du test", function () {
    expect($assessmentResults.text()).to.contains(course.attrs.fields["Nom"]);
  });

  it("10.5. affiche le rapport nombre de réponses saisies sur nombre d'épreuves du test", function () {
    const expectedString = `${answers.length} question(s) sur ${challenges.length}`;
    expect($assessmentResults.text()).to.contains(expectedString);
  });

  it("11.1. propose un moyen pour revenir à la liste des tests", function () {
    const $homeLink = findWithAssert('.home-link');
    expect($homeLink.attr('href')).to.equal('/home');
  });

});
