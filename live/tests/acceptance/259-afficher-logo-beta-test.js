import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 259 - Afficher le logo BETA | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  it('Le logo est présent sur la page index', function () {
    visit('/');
    andThen(() => {
      findWithAssert('.beta-logo');
    });
  });

  it('Le logo est présent sur la page de liste des tests', function () {
    visit('/home');
    andThen(() => {
      findWithAssert('.beta-logo');
    });
  });

  it('Le logo est présent sur la page d\'une épreuve', function () {
    visit('/assessments/new_assessment_id/challenges/qcu_challenge');
    andThen(() => {
      findWithAssert('.beta-logo');
    });
  });

});
