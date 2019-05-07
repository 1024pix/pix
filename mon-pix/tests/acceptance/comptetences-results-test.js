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

describe('Acceptance | competences results', function() {
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

    it('should display a return link to profilv2', async function() {
      // when
      await visit('/competences/resultats/111');

      // then
      expect(find('.competence-results-panel-header__return-button')).to.have.lengthOf(1);
      expect(find('.competence-results-panel-header__return-button').attr('href')).to.equal('/profilv2');
    });

  });
});
