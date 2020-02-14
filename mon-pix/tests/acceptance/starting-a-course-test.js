import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateViaEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Starting a course', function() {
  setupApplicationTest();
  setupMirage();
  let user;
  let assessment;
  let urlOfFirstChallenge;

  beforeEach(async function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
    await authenticateViaEmail(user);
    await visitWithAbortedTransition('/profil');
  });

  it('should be able to start a test directly from the course endpoint', async function() {
    assessment = server.create('assessment');
    urlOfFirstChallenge = `/assessments/${assessment.id}/challenges/receop4TZKvtjjG0V`;
    await visitWithAbortedTransition(`/courses/${assessment.course.id}`);
    expect(currentURL()).to.be.equal(urlOfFirstChallenge);
  });

  it('should resume the assessment', async function() {
    // given
    const startedAssessment = server.create('assessment', 'withStartedState', 'withPlacementType');

    //when
    await visitWithAbortedTransition(`/courses/${startedAssessment.course.id}`);

    // then
    expect(currentURL()).to.be.equal(`/assessments/${startedAssessment.id}/challenges/receop4TZKvtjjG0V`);
  });

  it('should start an assessment', async function() {
    // given
    const completedAssessment = server.create('assessment', 'withCompletedState', 'withPlacementType');

    // when
    await visitWithAbortedTransition(`/courses/${completedAssessment.course.id}`);

    // then
    expect(currentURL()).to.be.equal(`/assessments/${completedAssessment.id}/results`);
  });
});
