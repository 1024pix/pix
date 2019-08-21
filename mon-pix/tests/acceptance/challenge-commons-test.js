import { click, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Common behavior to all challenges', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(async function() {
    defaultScenario(this.server);
    await authenticateAsSimpleUser();
    await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
  });

  it('should display the name of the test', function() {
    expect(find('.course-banner__name').textContent).to.contain('First Course');
  });

  it('should display the challenge instruction', function() {
    const instructionText = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
    expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(instructionText);
  });

  it('should format content written as [foo](bar) as clickable link', function() {
    expect(find('.challenge-statement__instruction a')).to.exist;
    expect(find('.challenge-statement__instruction a').textContent).to.equal('ouverte');
    expect(find('.challenge-statement__instruction a').getAttribute('href')).to.equal('http://link.ouverte.url');
  });

  it('should open links in a new tab', function() {
    expect(find('.challenge-statement__instruction a').getAttribute('target')).to.equal('_blank');
  });

  it('should display the skip button', function() {
    expect(find('.challenge-actions__action-skip')).to.exist;
  });

  it('should display the validate button', function() {
    expect(find('.challenge-actions__action-skip')).to.exist;
  });

  it('should display a button to come back to the courses list', function() {
    expect(find('.course-banner__home-link').textContent).to.equal('Revenir à l\'accueil');
  });

  it('should come back to the home route when the back button is clicked', async function() {
    // when
    await click('.course-banner__home-link');

    expect(currentURL()).to.equal('/profil');
  });

  it('should be able to send a feedback about the current challenge', () => {
    expect(find('.feedback-panel')).to.exist;
  });
});
