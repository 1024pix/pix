import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

const URL_OF_FIRST_TEST = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const START_BUTTON = '.competence-level-progress-bar__link-start';

describe('Acceptance | Starting a course', function() {

  let application;

  beforeEach(async function() {
    application = startApp();
    defaultScenario(server);
    await authenticateAsSimpleUser();
    await visit('/compte');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should be able to start a test directly from the course endpoint', async function() {
    await visit('/courses/ref_course_id');
    expect(currentURL()).to.be.equal(URL_OF_FIRST_TEST);
  });

  it('should redirect to the first course challenge when starting a new course', function() {
    const $startLink = findWithAssert(START_BUTTON);
    return click($startLink).then(function() {
      findWithAssert('.assessment-challenge');
      expect(currentURL()).to.contain(URL_OF_FIRST_TEST);
    });
  });

  it('should resume the assessment', async function() {
    // given
    server.create('assessment', {
      id: 1,
      courseId: 'recNPB7dTNt5krlMA',
      state: 'started',
      type: 'PLACEMENT',
    });
    //when
    await visit('/courses/recNPB7dTNt5krlMA');

    // then
    expect(currentURL()).to.be.equal('/assessments/1/challenges/receop4TZKvtjjG0V');
  });

  it('should start an assessment', async function() {
    // given
    server.create('assessment', {
      id: 1,
      courseId: 'recNPB7dTNt5krlMA',
      state: 'completed',
      type: 'PLACEMENT',
    });
    //when
    await visit('/courses/recNPB7dTNt5krlMA');

    // then
    expect(currentURL()).to.be.equal('/assessments/2/challenges/receop4TZKvtjjG0V');
  });
});
