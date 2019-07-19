import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Profile | Start competence', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateAsSimpleUser();
    });

    it('can start a competence', async function() {
      // when
      await visit('/profil');
      await click('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__button ');

      // then
      expect(currentURL()).to.contains('/assessments/');
      findWithAssert('.assessment-challenge__content');
    });
  });
});
