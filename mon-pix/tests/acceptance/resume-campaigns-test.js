import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser, logout } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Campaigns | Resume Campaigns', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Resume a campaigns course', function() {

    beforeEach(async function() {
      authenticateAsSimpleUser();
      await visit('/campagnes/codecampagnepix');
      await click('.campaign-landing-page__start-button');
      await click('.challenge-actions__action-skip');
    });

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visit('/compte');
        await logout();
      });

      it('should propose to reconnect', async function() {
        // given
        await visit('/campagnes/codecampagnepix');
        await click('.campaign-landing-page__start-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/connexion');
        });
      });

      /*it('should connect and redirect in assessment when we enter URL', async function() {
        // given
        await visit('/campagnes/codecampagnepix');
        await click('.campaign-landing-page__start-button');

        fillIn('#pix-email', 'jane@acme.com');
        fillIn('#pix-password', 'Jane1234');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
          expect(find('.progress-bar-info').text()).to.contains('2 / 5');
        });
      });
*/
    });

    context('When user is logged in', async function() {

      it('should redirect directly in assessment when we enter URL', async function() {
        // given
        await visit('/compte');
        await visit('/campagnes/codecampagnepix');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
          expect(find('.progress-bar-info').text()).to.contains('2 / 5');
        });
      });
    });
  });
});
