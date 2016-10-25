import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 14 - Créer une épreuve de type QROC | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/challenges/qrocm_challenge_id/preview`);
  });

  it('14.1 un champ input text est affiché', function () {
    findWithAssert('.challenge-proposals input[type="text"]');
  });
});
