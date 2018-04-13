import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { authenticateAsSimpleUser } from '../helpers/testing';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | User certifications page', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Access to the user certifications page', function() {

    it('should not be accessible when user is not connected', async function() {
      // when
      await visit('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('should be accessible when user is connected', async function() {
      // given
      await authenticateAsSimpleUser();

      // when
      await visit('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });
  });

  describe('Display', function() {

    it('should render the banner', async function() {
      // when
      await authenticateAsSimpleUser();
      await visit('/mes-certifications');

      // then
      findWithAssert('.navbar-header__container');
    });

    it('should render a title for the page', async function() {
      // when
      await authenticateAsSimpleUser();
      await visit('/mes-certifications');

      // then
      findWithAssert('.user-certifications-page__title');
    });

    it('should render the list of certifications of the connected user', async function() {
      // when
      await authenticateAsSimpleUser();
      await visit('/mes-certifications');

      // then
      findWithAssert('.certifications-list');
    });

    it('should render the app footer', async function() {
      // when
      await authenticateAsSimpleUser();
      await visit('/mes-certifications');

      // then
      findWithAssert('.app-footer');
    });
  });

});
