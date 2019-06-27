import { currentURL, find, findAll } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Course ending screen', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(async function() {
    defaultScenario(this.server);
    await visitWithAbortedTransition('/assessments/ref_assessment_id/results');
  });

  it('should be available directly from the url', function() {
    expect(currentURL()).to.equal('/assessments/ref_assessment_id/results');
  });

  it('should display a summary of all the answers', function() {
    expect(find('.assessment-results__list')).to.exist;
  });

  it('should display the matching instructions', function() {
    expect(findAll('.result-item')[0].textContent).to.contain('Un QCM propose plusieurs choix');
    expect(findAll('.result-item')[1].textContent).to.contain('Un QCU propose plusieurs choix');
    expect(findAll('.result-item')[2].textContent).to.contain('Un QROC est une question ouverte');
    expect(findAll('.result-item')[3].textContent).to.contain('Un QROCM est une question ouverte');
  });

  it('should provide a valid answer when the user answered wrongly', function() {
    expect(findAll('div[data-toggle="tooltip"]')[0].getAttribute('data-original-title')).to.equal('Réponse incorrecte');
  });

  it('should display the course name', function() {
    expect(find('.course-banner__name').textContent).to.contain('First Course');
  });

  it('should not display the back button to return to the home page', function() {
    expect(find('.course-banner__home-link')).to.not.exist;
  });

  it('should display a way to come back to the test list', function() {
    expect(find('.assessment-results__index-link-container')).to.exist;
  });

  it('should display the course banner', function() {
    expect(find('.assessment-results__course-banner')).to.exist;
  });

});
