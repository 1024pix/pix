import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsPrescriber, authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Profil v2 | Afficher profil v2', function() {
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

    it('can visit /profilv2', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(currentURL()).to.equal('/profilv2');
    });

    it('should display pixscore', async function() {
      await visit('/profilv2');

      // then
      expect(find('.hexagon-score-content__pix-score').text()).to.contains('196');
    });

    it('should display first competence card', async function() {
      // when
      await visit('/profilv2');

      // then
      findWithAssert('.rounded-panel-body :first-child');
      expect(find('.scorecard:first-child .scorecard-content__area').text()).to.contains('Information et données');
    });
  });

  describe('Authenticated cases as user with organization', function() {
    beforeEach(async function() {
      await authenticateAsPrescriber();
    });

    it('can visit /profilv2', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(currentURL()).to.equal('/board');
    });
  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visit('/profilv2');
      expect(currentURL()).to.equal('/connexion');
    });

    it('should stay in /connexion, when authentication failed', async function() {
      // given
      await visit('/connexion');
      await fillIn('#email', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
