import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Course ending screen', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/assessments/ref_assessment_id/results');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should be available directly from the url', function() {
    expect(currentURL()).to.equal('/assessments/ref_assessment_id/results');
  });

  it('should display a summary of all the answers', function() {
    findWithAssert('.assessment-results__list');
  });

  it('should display the matching instructions', function() {
    const $proposals = findWithAssert('.result-item');
    expect($proposals.text()).to.contain('Un QCM propose plusieurs choix');
    expect($proposals.text()).to.contain('Un QCU propose plusieurs choix');
    expect($proposals.text()).to.contain('Un QROC est une question ouverte');
    expect($proposals.text()).to.contain('Un QROCM est une question ouverte');
  });

  it('should provide a valid answer when the user answered wrongly', function() {
    const $cell = findWithAssert('div[data-toggle="tooltip"]:eq(0)');
    expect($cell.attr('data-original-title')).to.equal('Réponse incorrecte');
  });

  it('should display the course name', function() {
    expect(findWithAssert('.course-banner__name').text()).to.contain('First Course');
  });

  it('should not display the back button to return to the home page', function() {
    expect(find('.course-banner__home-link')).to.have.lengthOf(0);
  });

  it('should display a way to come back to the test list', function() {
    findWithAssert('.assessment-results__index-link-container');
  });

  it('should display the course banner', function() {
    findWithAssert('.assessment-results__course-banner');
  });

});
