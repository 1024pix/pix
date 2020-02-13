import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateViaEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const URL_OF_FIRST_TEST = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id_not_yet_answered';

describe('Acceptance | Starting a course', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
    await authenticateViaEmail(user);
    await visitWithAbortedTransition('/profil');
  });

  it('should be able to start a test directly from the course endpoint', async function() {
    await visitWithAbortedTransition('/courses/ref_course_id');
    expect(currentURL()).to.be.equal(URL_OF_FIRST_TEST);
  });

  it('should resume the assessment', async function() {
    // given
    this.server.create('assessment', {
      id: 1,
      courseId: 'recNPB7dTNt5krlMA',
      state: 'started',
      type: 'PLACEMENT',
    });
    //when
    await visitWithAbortedTransition('/courses/recNPB7dTNt5krlMA');

    // then
    expect(currentURL()).to.be.equal('/assessments/1/challenges/receop4TZKvtjjG0V');
  });

  it('should start an assessment', async function() {
    // given
    this.server.create('assessment', {
      id: 1,
      courseId: 'recNPB7dTNt5krlMA',
      state: 'completed',
      type: 'PLACEMENT',
    });
    //when
    await visitWithAbortedTransition('/courses/recNPB7dTNt5krlMA');

    // then
    expect(currentURL()).to.be.equal('/assessments/2/challenges/receop4TZKvtjjG0V');
  });
});
