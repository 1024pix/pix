import {
  describe,
  it,
  before,
  after
} from 'mocha';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a2 - Afficher le logo PIX | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  it('a2.1 Le logo est présent sur la page index', function () {
    visit('/');
    andThen(() => {
      findWithAssert($('img[src="images/pix-logo.svg"]'));
    });
  });

  it('a2.2 Le logo est présent sur la page d\'une épreuve', function () {
    visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
    andThen(() => {
      findWithAssert($('img[src="images/pix-logo.svg"]'));
    });
  });

});
