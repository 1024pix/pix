import { describe, it, beforeEach, afterEach } from 'mocha';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a2 - Afficher le logo PIX | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('a2.1 Le logo est présent sur la page index', async function () {
    await visit('/');
    findWithAssert($('.app-header-logo-svg'));
  });

  it('a2.2 Le logo est présent sur la page d\'une épreuve', async function () {
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
    findWithAssert($('.app-header-logo-svg'));
  });

});
