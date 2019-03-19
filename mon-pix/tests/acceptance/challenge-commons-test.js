import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Common behavior to all challenges', function() {

  let application;

  beforeEach(async function() {
    application = startApp();
    defaultScenario(server);
    await authenticateAsSimpleUser();
    await visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should display the name of the test', function() {
    expect(findWithAssert('.course-banner__name').text()).to.contain('First Course');
  });

  it('should display the challenge instruction', function() {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructiontext = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
    expect($challengeInstruction.text().trim()).to.equal(instructiontext);
  });

  it('should format content written as [foo](bar) as clickable link', function() {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('ouverte');
    expect($links.attr('href')).to.equal('http://link.ouverte.url');
  });

  it('should open links in a new tab', function() {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('should display the skip button', function() {
    expect($('.challenge-actions__action-skip')).to.have.lengthOf(1);
  });

  it('should display the validate button', function() {
    expect($('.challenge-actions__action-skip')).to.have.lengthOf(1);
  });

  it('should display a button to come back to the courses list', function() {
    const $courseListButton = findWithAssert('.course-banner__home-link');
    expect($courseListButton.text()).to.equal('Revenir à l\'accueil');
  });

  it('should come back to the home route when the back button is clicked', function() {
    // when
    click('.course-banner__home-link');

    // then
    andThen(() => expect(currentURL()).to.equal('/compte'));
  });

  it('should be able to send a feedback about the current challenge', () => {
    expect($('.feedback-panel')).to.have.lengthOf(1);
  });
});
