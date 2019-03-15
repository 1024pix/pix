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

describe('Acceptance | Profil v2 | Afficher profil v2', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Authenticated cases', function() {
    it('can visit /profilv2', async function() {
      // given
      await authenticateAsSimpleUser();

      // when
      await visit('/profilv2');

      // then
      return andThen(() => {
        expect(currentURL()).to.equal('/profilv2');
      });
    });

    it('should display provided score in hexagon', async function() {
      // given
      await authenticateAsSimpleUser();

      // when
      await visit('/profilv2');

      // then
      return andThen(() => {
        expect(find('.profilv2-header-hexagon-score-content__pix-score').text().trim()).to.equal('456');
      });
    });

  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visit('/profilv2');
      return andThen(() => {
        expect(currentURL()).to.equal('/connexion');
      });
    });

    it('should stay in /connexion, when authentication failed', async function() {
      // given
      await visit('/connexion');
      fillIn('#email', 'anyone@pix.world');
      fillIn('#password', 'Pix20!!');

      // when
      click('.button');

      // then
      return andThen(function() {
        expect(currentURL()).to.equal('/connexion');
      });
    });
  });
});
