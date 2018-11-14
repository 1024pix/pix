import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

const URL_OF_FIRST_TEST = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const START_BUTTON = '.competence-level-progress-bar__link-start';

describe('Acceptance | Démarrer un test', function() {

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

  it('Je peux démarrer un test directement depuis la nouvelle url "courses/:course_id"', async function() {
    await visit('/courses/ref_course_id');
    andThen(() => {
      expect(currentURL()).to.be.equal('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
    });
  });

  it('Quand je démarre un test, je suis redirigé vers la première épreuve du test', function() {
    const $startLink = findWithAssert(START_BUTTON);
    return click($startLink).then(function() {
      findWithAssert('.assessment-challenge');
      expect(currentURL()).to.contain(URL_OF_FIRST_TEST);
    });
  });

});
