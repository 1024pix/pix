import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Campaigns | Start Campaigns', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Start a campaigns course', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visit('/campagnes/codecampagnepix');
      });

      it('should redirect to login page when user start', async function() {
        await click('.campaign-landing-page__start-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/connexion');
        });
      });

      it('should redirect to campaigns after connexion', async function() {
        await click('.campaign-landing-page__start-button');

        // when
        expect(currentURL()).to.equal('/connexion');
        fillIn('#pix-email', 'jane@acme.com');
        fillIn('#pix-password', 'Jane1234');
        await click('.signin-form__submit_button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
        });
      });

    });

    context('When user is logged in', async function() {

      beforeEach(async function() {
        authenticateAsSimpleUser();
        await visit('/campagnes/codecampagnepix');
      });

      it('should redirect directly in campaigns', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/campagnes/codecampagnepix');
          expect(find('.campaign-landing-page__start-button').text().trim()).to.equal('Je commence');
        });
      });

      it('should start the campaign after clicking "I start" button', async function() {
        // when
        await click('.campaign-landing-page__start-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains(/assessments/);
          expect(find('.course-banner__name').text()).to.equal('');
          findWithAssert('.assessment-challenge__progress-bar');
        });
      });

    });
  });
});
