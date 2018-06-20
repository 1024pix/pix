import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const URL_OF_FIRST_TEST = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const MODAL_SELECTOR = '.modal-content';
const MODAL_DISMISS_BUTTON = '.modal-mobile__dismiss-link';
const START_BUTTON = 'a[title=\'Commencer le test "First Course"\']';

describe('Acceptance | a4 - Démarrer un test |', function() {

  let application;

  beforeEach(async function() {
    application = startApp();
    await visit('/');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('a4.2 Je peux démarrer un test directement depuis la nouvelle url "courses/:course_id"', async function() {
    await visit('/courses/ref_course_id');

    expect(currentURL()).to.be.equal('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  });

  it('a4.4 Quand je démarre un test, je suis redirigé vers la première épreuve du test', async function() {
    const $startLink = findWithAssert(START_BUTTON);
    await click($startLink);

    findWithAssert('.assessment-challenge');
    expect(currentURL()).to.contain(URL_OF_FIRST_TEST);
  });

  it('a4.5 Quand je démarre un test sur mobile, une modale m\'averti que l\'expérience ne sera pas optimale, mais je peux quand même continuer', async function() {
    const $startLink = findWithAssert(START_BUTTON);

    expect(find(MODAL_SELECTOR)).to.have.lengthOf(0);

    // test on mobile
    await triggerEvent('.course-list', 'simulateMobileScreen');

    // clear local storage
    window.localStorage.clear();
    expect(currentURL()).to.equals('/');
    expect(find(MODAL_SELECTOR)).to.have.lengthOf(0);

    // start a test
    await click($startLink);

    expect(find(MODAL_SELECTOR)).to.have.lengthOf(1);
    expect(currentURL()).to.equals('/');
    await click(MODAL_DISMISS_BUTTON);

    await click($startLink);
    expect(currentURL()).to.contain(URL_OF_FIRST_TEST);
  });

  it('a4.6 Quand je RE-démarre un test sur mobile, la modale NE s\'affiche PAS', async function() {
    const $startLink = findWithAssert(START_BUTTON);
    await triggerEvent('.index-page', 'simulateMobileScreen');

    expect(currentURL()).to.equals('/');
    expect(find(MODAL_SELECTOR)).to.have.lengthOf(0);

    await click($startLink);

    expect(currentURL()).to.contain('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  });
});
