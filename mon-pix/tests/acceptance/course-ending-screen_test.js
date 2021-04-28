import { click, currentURL, find, findAll } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import visit from '../helpers/visit';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Course ending screen', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let firstChallenge;
  let secondChallenge;

  beforeEach(async function() {
    assessment = server.create('assessment', 'ofDemoType');
    firstChallenge = server.create('challenge', 'forDemo', 'QCU');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge: firstChallenge,
      assessment,
    });
    secondChallenge = server.create('challenge', 'forDemo', 'QCM');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge: secondChallenge,
      assessment,
    });
    await visit(`/assessments/${assessment.id}/results`);
  });

  it('should be available directly from the url', function() {
    expect(currentURL()).to.equal(`/assessments/${assessment.id}/results`);
  });

  it('should display a summary of all the answers', function() {
    expect(find('.assessment-results__list')).to.exist;
  });

  it('should display the matching instructions', function() {
    expect(findAll('.result-item')[0].textContent.trim()).to.contain(firstChallenge.instruction);
    expect(findAll('.result-item')[1].textContent.trim()).to.contain(secondChallenge.instruction);
  });

  it('should display the course name', function() {
    expect(find('.assessment-banner__title').textContent).to.contain(assessment.title);
  });

  it('should not display the back button to return to the home page', function() {
    expect(find('.assessment-banner__home-link')).to.not.exist;
  });

  it('should display a way to come back to the test list', function() {
    expect(find('.assessment-results__index-link-container')).to.exist;
  });

  it('should display the course banner', function() {
    expect(find('.assessment-results__assessment-banner')).to.exist;
  });

  it('should display a button that redirect to inscription page', async function() {
    expect(find('.assessment-results__index-link__element')).to.exist;
    expect(find('.assessment-results__link-back').textContent).to.contains('Continuer mon expérience Pix');
    await click(find('.assessment-results__index-link__element'));

    expect(currentURL()).to.equal('/inscription');
  });

});
